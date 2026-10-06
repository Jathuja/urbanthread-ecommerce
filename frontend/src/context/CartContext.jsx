import { createContext, useContext, useState, useEffect, useMemo } from 'react';

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

  const contextValue = {
    cart,
    cartCount: cartItemCount,
    cartTotal,
    subtotal: cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
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
