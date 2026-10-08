# UrbanThread — Full-Stack E-Commerce Platform

UrbanThread is a modern full-stack clothing and fashion e-commerce platform built as part of a Software Engineer Intern technical assessment. The application provides customers with a responsive shopping experience featuring multi-attribute apparel browsing (sizes and colors), cart management, customer authentication, order tracking, PayHere Sandbox payment integration, and direct WhatsApp order submission, paired with a protected back-office administration panel for catalog and order fulfillment.

---

## Project Overview

The UrbanThread platform provides a complete end-to-end e-commerce workflow:
- Customer storefront with a modern, responsive user interface.
- Product catalog browsing with full-text search, category filtering, size filtering, and price/name sorting.
- Dynamic product detail views with real-time size and color variant selection and inventory feedback.
- Persistent client-side cart management with stock limits enforcement.
- Streamlined checkout flow supporting delivery address capture and special order notes.
- Customer authentication with profile management and complete personal order history.
- Protected administrator authentication with role-based access control.
- Administrative dashboard displaying platform revenue, order metrics, and inventory summaries.
- Comprehensive administrative product and variant inventory management (create, update, soft-delete, stock adjustment).
- Administrative order management with filtering and status update workflows.
- PayHere Sandbox payment gateway integration with secure hash verification and IPN callbacks.
- Direct WhatsApp order placement that pre-populates itemized order summaries.

---

## Key Features

### Customer Storefront
- **Home Showcase**: Curated hero banner, categorized collections (Men, Women, Accessories), and featured product cards.
- **Product Catalog**: Paginated browsing with interactive search, category selection, size filtering, price range sorting, and stock status indicators.
- **Product Details & Variant Selection**: Dynamic image display, product description, and interactive variant matrix (size and colour) displaying real-time stock availability.
- **Cart & Checkout**: Persistent cart state, item quantity adjustments within available stock boundaries, delivery fee calculation, and order submission.
- **Customer Authentication & Profile**: User registration, login, secure session management, profile details updating, and order history lookup.

### Administrative Management
- **Protected Access**: Route guards and server-side middleware ensuring only users with the `admin` role can access administrative resources.
- **Metrics Dashboard**: Overview of total revenue, total orders, completed orders, pending orders, and total active products.
- **Product Management**: Ability to add new apparel items, update existing details (name, category, price, description, image URL), and toggle product active status.
- **Variant & Inventory Control**: Management of individual size and color combinations with direct stock quantity adjustments.
- **Order Fulfillment**: Complete listing of all customer orders with filters by order status and payment status, order detail inspection, and status transitions (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).

### Payment & Order Channels
- **PayHere Sandbox Integration**: Checkout flow generating secure MD5 hash signatures for sandbox payment validation, redirecting through the PayHere gateway, and handling IPN webhook callbacks.
- **WhatsApp Order Flow**: Generates a structured, pre-formatted order summary with order ID, customer information, item breakdown, and total price, opening a direct WhatsApp chat with the merchant.
- **Cash on Delivery**: Standard checkout option allowing immediate order creation with pending payment status.

---

## Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `mysql2` (Connection Pool & Promises)
- **Authentication**: `jsonwebtoken` (JWT), `bcryptjs`
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`
- **Configuration**: `dotenv`

### Deployment & Third-Party Services
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: Railway MySQL
- **Payment Processing**: PayHere Sandbox
- **Messaging Integration**: WhatsApp Click-to-Chat

---

## System Architecture

```text
+-------------------------------------------------------------+
|                      Customer Browser                       |
+-------------------------------------------------------------+
                               |
                               | HTTPS / REST API
                               v
+-------------------------------------------------------------+
|               Vercel Hosted React Frontend                  |
+-------------------------------------------------------------+
                               |
                               | HTTPS / JSON
                               v
+-------------------------------------------------------------+
|              Railway Hosted Express Backend                 |
+-------------------------------------------------------------+
          |                            |                |
          | SQL Queries                | Secure Hash    | Redirect
          v                            v                v
+-------------------+        +-----------------+  +-----------------+
|   Railway MySQL   |        | PayHere Sandbox |  | WhatsApp Direct |
|     Database      |        | Payment Gateway |  |  Communication  |
+-------------------+        +-----------------+  +-----------------+
```

---

## Project Structure

```text
urbanthread-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── adminOrderController.js
│   │   │   ├── adminProductController.js
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validateAdminOrder.js
│   │   │   ├── validateAdminProduct.js
│   │   │   ├── validateAuthRequest.js
│   │   │   ├── validateOrderRequest.js
│   │   │   └── validateProductQuery.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── productRoutes.js
│   │   ├── scripts/
│   │   │   ├── schema.sql
│   │   │   ├── seedAdmin.js
│   │   │   ├── setupDatabase.js
│   │   │   └── testEndpoints.js
│   │   ├── services/
│   │   │   ├── adminOrderService.js
│   │   │   ├── adminProductService.js
│   │   │   ├── adminService.js
│   │   │   ├── authService.js
│   │   │   ├── categoryService.js
│   │   │   ├── orderService.js
│   │   │   ├── payhereService.js
│   │   │   └── productService.js
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── FeaturedProducts.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── PromoSection.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── whatsapp.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Database Design

The relational database is designed in MySQL with normalized tables, foreign key constraints, and performance indexes.

### Tables & Relationships

- **`users`**
  - Stores customer and administrator accounts.
  - Fields: `id`, `name`, `email` (unique index), `password_hash`, `phone`, `address`, `city`, `role` (`customer`, `admin`), `created_at`, `updated_at`.
- **`categories`**
  - Stores clothing categories.
  - Fields: `id`, `name` (unique), `created_at`.
- **`products`**
  - Catalog items associated with a category.
  - Fields: `id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_active`, `created_at`, `updated_at`.
  - Relationship: Foreign key on `category_id` references `categories(id)` (`ON DELETE RESTRICT`).
- **`product_variants`**
  - Specific SKU variations defining size, color, and available stock.
  - Fields: `id`, `product_id`, `size`, `colour`, `stock`.
  - Relationship: Foreign key on `product_id` references `products(id)` (`ON DELETE CASCADE`).
- **`orders`**
  - Records customer transactions and fulfillment states.
  - Fields: `id`, `user_id` (nullable for guest/direct checkout), `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `shipping_city`, `notes`, `subtotal`, `delivery_fee`, `total`, `payment_method` (`whatsapp`, `payhere`, `cash_on_delivery`), `payment_status` (`pending`, `paid`, `failed`, `refunded`), `order_status` (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`), `created_at`, `updated_at`.
  - Relationship: Foreign key on `user_id` references `users(id)` (`ON DELETE SET NULL`).
- **`order_items`**
  - Line items snapshotting purchase prices and variant details at the time of purchase.
  - Fields: `id`, `order_id`, `product_id`, `variant_id`, `product_name`, `size`, `colour`, `unit_price`, `quantity`, `subtotal`.
  - Relationships: Foreign keys to `orders(id)` (`ON DELETE CASCADE`), `products(id)` (`ON DELETE RESTRICT`), and `product_variants(id)` (`ON DELETE RESTRICT`).

---

## Authentication & Security

- **Password Hashing**: User passwords are encrypted using `bcryptjs` before storage; raw passwords are never stored.
- **JWT Authentication**: Stateless authentication utilizing JSON Web Tokens with expiry; tokens are verified via authentication middleware.
- **Role-Based Authorization**: Administrative endpoints require both a valid token and an explicit `role === 'admin'` claim.
- **Customer Ownership Enforcement**: Order queries verify that non-admin authenticated users can only retrieve orders corresponding to their own user identifier.
- **Input Validation**: Request parameters, queries, and bodies are validated and sanitized using `express-validator` middleware before hitting service layers.
- **Security Headers**: Standard security headers configured via `helmet`.
- **CORS Protection**: In production, CORS is restricted to authorized origins specified in the `FRONTEND_URL` environment variable.
- **Payment Verification**: PayHere parameters and incoming IPN notifications are verified using server-side MD5 signature calculations.
- **Credential Protection**: All sensitive tokens, secrets, and database credentials are managed exclusively via environment variables.

---

## API & Backend

All endpoints are prefixed with `/api`.

### Health Check
- `GET /api/health`: Service health verification.

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new customer account.
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Retrieve current user profile (Protected).
- `PUT /api/auth/profile`: Update user contact information (Protected).
- `PUT /api/auth/password`: Change account password (Protected).

### Categories (`/api/categories`)
- `GET /api/categories`: Retrieve all categories.

### Products (`/api/products`)
- `GET /api/products`: Retrieve active products with filtering (`category`, `size`, `search`, `sort`, `page`, `limit`).
- `GET /api/products/:id`: Retrieve single product with its associated variants.

### Orders (`/api/orders`)
- `POST /api/orders`: Place a new order (supports guest and authenticated users).
- `GET /api/orders`: Retrieve order history (filtered by authenticated user).
- `GET /api/orders/:id`: Retrieve single order details with ownership verification.
- `GET /api/orders/:id/payhere-params`: Generate signed payment parameters for PayHere checkout.
- `POST /api/orders/payhere-notify`: PayHere IPN callback endpoint for status updates.

### Admin (`/api/admin` - Protected, requires admin role)
- `GET /api/admin/dashboard`: Platform metrics (revenue, order stats, product counts).
- `GET /api/admin/products`: Retrieve all products (including inactive items).
- `GET /api/admin/products/:id`: Retrieve product details for administrative editing.
- `POST /api/admin/products`: Create a new product.
- `PUT /api/admin/products/:id`: Update product information.
- `DELETE /api/admin/products/:id`: Deactivate/delete a product.
- `POST /api/admin/products/:id/variants`: Add a new variant to a product.
- `PUT /api/admin/products/:id/variants/:variantId`: Update variant stock and attributes.
- `DELETE /api/admin/products/:id/variants/:variantId`: Remove a variant.
- `GET /api/admin/orders`: List all orders with status filters.
- `GET /api/admin/orders/:id`: Detailed view of an order for fulfillment.
- `PUT /api/admin/orders/:id/status`: Update fulfillment and payment statuses.

---

## Payment & WhatsApp Workflows

### PayHere Sandbox Flow
1. Customer selects PayHere at checkout and submits the order.
2. The order is recorded in the database with status `pending`.
3. The frontend requests pre-calculated payment parameters from `GET /api/orders/:id/payhere-params`.
4. The backend computes the PayHere MD5 signature using `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET`.
5. The frontend constructs and submits the form to the PayHere Sandbox portal (`PAYHERE_SANDBOX_URL`).
6. After processing, PayHere issues an IPN webhook call to `POST /api/orders/payhere-notify`, which validates the signature and marks payment status as `paid` and order status as `confirmed`.

### WhatsApp Order Flow
1. Customer selects WhatsApp as the payment and ordering method.
2. The frontend creates the order on the backend to record customer details and reserve stock.
3. Upon receiving the order confirmation, the frontend formats a structured WhatsApp message containing:
   - Order ID
   - Customer name, phone, and delivery address
   - Itemized list of products (name, size, color, quantity, price)
   - Order total and payment mode
4. The customer is redirected via WhatsApp Click-to-Chat (`https://wa.me/<VITE_WHATSAPP_NUMBER>`) to complete communication directly with the store administrator.

---

## Environment Variables

All sensitive values and environment-specific settings are loaded through environment variables. Secret values must never be committed to source control.

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5001

# Database Configuration (Railway MySQL / Local MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=urbanthread_db

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Deployment URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

# PayHere Sandbox Credentials
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX_URL=https://sandbox.payhere.lk/pay/checkout

# Admin Seed Account (Used by seed scripts)
ADMIN_EMAIL=admin@urbanthread.com
ADMIN_PASSWORD=your_admin_seed_password
ADMIN_NAME=UrbanThread Admin

# WhatsApp Business Number
WHATSAPP_NUMBER=947XXXXXXXX
```

### Frontend (`frontend/.env`)

```env
# API Base URL
VITE_API_URL=http://localhost:5001

# WhatsApp Business Contact (International format without '+' sign)
VITE_WHATSAPP_NUMBER=947XXXXXXXX
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- MySQL Server (v8+) or a remote MySQL instance

### 1. Clone the Repository
```bash
git clone https://github.com/Jathuja/urbanthread-ecommerce.git
cd urbanthread-ecommerce
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your local MySQL credentials and secret keys

# Initialize database schema and seed sample catalog
npm run db:setup

# Seed initial admin account
npm run seed:admin

# Start the development server (default port 5001)
npm run dev
```

The backend API health check will be accessible at:
```bash
curl http://localhost:5001/api/health
```

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Ensure VITE_API_URL is set to http://localhost:5001

# Start the Vite development server
npm run dev
```

The frontend application will be accessible at `http://localhost:5173`.

---

## Testing & Verification

The codebase includes automated test suites and validation scripts. Verified project status:

- **Backend API Test Suite**: 97 passed, 0 failed (`npm run test:api` in `backend/`)
- **Frontend Code Quality**: 0 lint errors (`npm run lint` in `frontend/`)
- **Frontend Production Build**: Successfully compiled (`npm run build` in `frontend/`)

---

## Deployment

The application is deployed with continuous deployment from the GitHub `main` branch:

- **Frontend**: Hosted on **Vercel** with automated build integration on commit push, configured with production environment variables (`VITE_API_URL`, `VITE_WHATSAPP_NUMBER`).
- **Backend**: Hosted on **Railway** container service running Node.js, with automatic restarts and configured environment variables (`PORT`, `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, `PAYHERE_*`).
- **Database**: Managed **MySQL** instance hosted on Railway with automated backups and persistent volumes.

---

## Live Links

- **GitHub Repository**: https://github.com/Jathuja/urbanthread-ecommerce
- **Live Application**: https://urbanthread-ecommerce.vercel.app
- **Backend API**: https://urbanthread-ecommerce-production.up.railway.app

---

## Assumptions & Notes

- This project was implemented as a technical assessment submission for a Software Engineer Intern position and is designed to demonstrate full-stack architecture, clean code practices, security measures, and third-party API integration.
- Payment testing is configured for the PayHere Sandbox environment; real financial transactions are not processed.
- Inventory is deducted during order creation to prevent race conditions during checkout.

---

## License

For technical assessment purposes.
