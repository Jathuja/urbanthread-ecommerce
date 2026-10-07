import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const CART_STORAGE_KEY = 'urbanthread_cart';

export const CartContext = createContext(null);

/**
 * Safely parse and retrieve cart from localStorage.
 * Handles corrupt JSON and non-array data by gracefully resetting.
 */
function loadCartFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid cart format in localStorage; resetting to empty array.');
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    // Filter valid cart items
    return parsed.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        item.productId !== undefined &&
        item.variantId !== undefined &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
  } catch (error) {
    console.error('Failed to parse cart JSON from localStorage, resetting:', error);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore localStorage removal errors in restricted environments
    }
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadCartFromStorage());

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to persist cart to localStorage:', error);
    }
  }, [cart]);

  // Synchronize cart across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        setCart(loadCartFromStorage());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Add a specific product variant to the cart.
   *
   * @param {Object} item - Cart item specifications
   * @param {number|string} item.productId - Product ID
   * @param {string} item.productName - Product name
   * @param {string} item.image - Product image URL
   * @param {number} item.price - Product unit price
   * @param {string} [item.category] - Product category name
   * @param {number|string} item.variantId - Unique variant ID
   * @param {string} item.size - Variant size (e.g., 'M')
   * @param {string} item.colour - Variant colour (e.g., 'Black')
   * @param {number} item.quantity - Quantity to add
   * @param {number} item.availableStock - Variant available stock
   *
   * @returns {{ success: boolean, message: string }} Result of the operation
   */
  const addToCart = (item) => {
    if (!item || item.productId === undefined || item.variantId === undefined) {
      return {
        success: false,
        message: 'Invalid product or variant selection.',
      };
    }

    const requestedQty = parseInt(item.quantity, 10);
    if (isNaN(requestedQty) || requestedQty < 1) {
      return {
        success: false,
        message: 'Quantity must be at least 1.',
      };
    }

    const availableStock = parseInt(item.availableStock, 10);
    if (isNaN(availableStock) || availableStock <= 0) {
      return {
        success: false,
        message: 'This product variant is currently out of stock.',
      };
    }

    if (requestedQty > availableStock) {
      return {
        success: false,
        message: `Cannot add ${requestedQty} units. Only ${availableStock} available in stock.`,
      };
    }

    // Check existing quantity in current cart for this specific variant
    const existingItem = cart.find(
      (c) =>
        String(c.productId) === String(item.productId) &&
        String(c.variantId) === String(item.variantId)
    );
    const existingQty = existingItem ? existingItem.quantity : 0;
    const combinedQty = existingQty + requestedQty;

    if (combinedQty > availableStock) {
      return {
        success: false,
        message: `Cannot add ${requestedQty} more. You already have ${existingQty} in your cart, and only ${availableStock} are available in stock.`,
      };
    }

    // Perform cart update
    setCart((prevCart) => {
      const index = prevCart.findIndex(
        (c) =>
          String(c.productId) === String(item.productId) &&
          String(c.variantId) === String(item.variantId)
      );

      if (index > -1) {
        // Increase existing item's quantity without exceeding stock
        const updated = [...prevCart];
        const current = updated[index];
        const newQty = Math.min(availableStock, current.quantity + requestedQty);

        updated[index] = {
          ...current,
          quantity: newQty,
          availableStock,
        };
        return updated;
      }

      // Add as a separate cart item for different variants
      const newItem = {
        id: `${item.productId}-${item.variantId}`,
        productId: item.productId,
        productName: item.productName || item.name || '',
        image: item.image || item.image_url || '',
        price: Number(item.price) || 0,
        category:
          typeof item.category === 'object'
            ? item.category?.name || ''
            : item.category || '',
        variantId: item.variantId,
        size: item.size,
        colour: item.colour,
        quantity: requestedQty,
        availableStock,
      };

      return [...prevCart, newItem];
    });

    return {
      success: true,
      message: 'Added to cart successfully!',
    };
  };

  /**
   * Remove an item from the cart by cart item ID or variant ID.
   */
  const removeFromCart = (idOrVariantId, productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        if (productId !== undefined) {
          return !(
            String(item.productId) === String(productId) &&
            String(item.variantId) === String(idOrVariantId)
          );
        }
        return (
          String(item.id) !== String(idOrVariantId) &&
          String(item.variantId) !== String(idOrVariantId)
        );
      })
    );
  };

  /**
   * Update quantity of a cart item.
   * Quantity must never become 0 or negative.
   * If quantity reaches 1, decrease action will not go below 1.
   * Quantity cannot exceed availableStock.
   */
  const updateQuantity = (idOrVariantId, newQuantity) => {
    const parsed = parseInt(newQuantity, 10);
    if (isNaN(parsed)) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (
          String(item.id) === String(idOrVariantId) ||
          String(item.variantId) === String(idOrVariantId)
        ) {
          // Never let quantity fall below 1
          const boundedMin = Math.max(1, parsed);
          // Never exceed available stock
          const boundedMax = Math.min(item.availableStock, boundedMin);

          return {
            ...item,
            quantity: boundedMax,
          };
        }
        return item;
      })
    );
  };

  /**
   * Clear all items from the cart.
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Calculate subtotal sum(price * quantity)
   */
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [cart]);

  const getCartTotal = () => cartTotal;

  /**
   * Calculate total items count sum(quantity)
   */
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [cart]);

  const getCartItemCount = () => cartItemCount;

  /**
   * Get quantity of a variant currently in the cart
   */
  const getItemQuantity = (productId, variantId) => {
    const found = cart.find(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.variantId) === String(variantId)
    );
    return found ? found.quantity : 0;
  };

  /**
   * Helper to format currency in LKR for display
   */
  const formatLKR = (amount) => {
    return `LKR ${Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Validate all cart items against the backend product and variant catalog.
   * Cleans out stale products, deleted variants, mismatched variants, and updates stock/price.
   * Returns: { valid: boolean, hasChanges: boolean, issues: string[] }
   */
  const validateAndSyncCart = useCallback(async () => {
    if (!cart || cart.length === 0) {
      return { valid: true, hasChanges: false, issues: [] };
    }

    try {
      // Group distinct product IDs to fetch from backend
      const productIds = [...new Set(cart.map((item) => Number(item.productId)).filter(Boolean))];
      const productMap = {};

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${pid}`);
            if (res.data?.success && res.data.data) {
              productMap[pid] = res.data.data;
            } else {
              productMap[pid] = null;
            }
          } catch {
            productMap[pid] = null;
          }
        })
      );

      const issues = [];
      const updatedCart = [];

      for (const item of cart) {
        const prod = productMap[Number(item.productId)];

        // Case 1: Product no longer exists or is inactive
        if (!prod || prod.is_active === false || prod.is_active === 0) {
          issues.push(`"${item.productName || 'Item'}" is no longer available.`);
          continue;
        }

        // Case 2: Variant does not belong to product or no longer exists
        const matchedVariant = (prod.variants || []).find(
          (v) => Number(v.id) === Number(item.variantId)
        );

        if (!matchedVariant) {
          issues.push(
            `"${item.productName || prod.name}" (${item.size || ''} / ${item.colour || ''}) is no longer available.`
          );
          continue;
        }

        // Case 3: Variant is out of stock (stock <= 0)
        if (matchedVariant.stock <= 0) {
          issues.push(
            `"${item.productName || prod.name}" (${matchedVariant.size} / ${matchedVariant.colour}) is currently out of stock.`
          );
          continue;
        }

        // Case 4: Quantity exceeds current available stock
        let finalQuantity = Number(item.quantity);
        if (finalQuantity > matchedVariant.stock) {
          issues.push(
            `Quantity for "${prod.name}" (${matchedVariant.size} / ${matchedVariant.colour}) was adjusted to available stock (${matchedVariant.stock}).`
          );
          finalQuantity = matchedVariant.stock;
        }

        // Keep item with updated server-verified data
        updatedCart.push({
          ...item,
          productName: prod.name,
          price: Number(prod.price),
          image: prod.image_url || item.image,
          category: prod.category?.name || item.category || '',
          size: matchedVariant.size,
          colour: matchedVariant.colour,
          quantity: finalQuantity,
          availableStock: matchedVariant.stock,
        });
      }

      const hasChanges =
        updatedCart.length !== cart.length ||
        updatedCart.some((u, i) => {
          const original = cart[i];
          return (
            !original ||
            Number(u.variantId) !== Number(original.variantId) ||
            Number(u.quantity) !== Number(original.quantity) ||
            Number(u.price) !== Number(original.price)
          );
        });

      if (hasChanges) {
        setCart(updatedCart);
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
        } catch {
          // ignore
        }
      }

      return {
        valid: issues.length === 0,
        hasChanges,
        issues,
      };
    } catch (err) {
      console.warn('Cart validation error:', err);
      return { valid: true, hasChanges: false, issues: [] };
    }
  }, [cart]);

  const contextValue = {
    cart,
    cartCount: cartItemCount,
    cartTotal,
    subtotal: cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    validateAndSyncCart,
    getCartTotal,
    getCartItemCount,
    getItemQuantity,
    formatLKR,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use CartContext
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
