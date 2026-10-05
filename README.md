# UrbanThread

UrbanThread is a modern full-stack e-commerce web application tailored for a clothing and fashion store. It supports browsing apparel with multiple sizes and colors, inventory tracking, cart management, checkout with PayHere Sandbox payment integration, and direct WhatsApp order submission, alongside a protected admin panel for back-office operations.

---

## Project Overview

UrbanThread is built as part of a Software Engineer Intern technical assessment. The application offers customers a smooth online shopping experience for fashion and apparel, while providing administrators with tools to manage products, inventory variants, and incoming customer orders.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `mysql2`
- **Security & Utilities**: `helmet`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `express-validator`

### Database & Third-Party Services
- **Database**: MySQL (hosted on Railway)
- **Payment Gateway**: PayHere Sandbox
- **Messaging Integration**: WhatsApp (direct order messaging)

### Deployment Targets
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway MySQL

---

## Project Structure

```text
urbanthread-ecommerce/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Products.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- Git

### 1. Clone & Navigate
```bash
git clone https://github.com/Jathuja/urbanthread-ecommerce.git
cd urbanthread-ecommerce
```

### 2. Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Note: On macOS, port 5000 is often reserved by AirPlay Receiver / ControlCenter. Set `PORT=5001` or another open port if needed).*
4. Start the server:
   ```bash
   # Development mode with watch
   npm run dev

   # Or standard start
   npm start
   ```
5. Test health check endpoint:
   ```bash
   curl http://localhost:5000/api/health
   # or http://localhost:5001/api/health if PORT was changed
   ```

### 3. Frontend Setup
1. Navigate into the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## Planned Features (Roadmap)

The following features are planned for future development phases:

- [ ] **Database Integration**: MySQL schema design with tables for products, variants (size, color, stock), categories, orders, order items, and admin users.
- [ ] **Product Catalog & Details**: Browse products, search, category/size/color filtering, and dynamic product details pages.
- [ ] **Shopping Cart**: Client-side / persistent cart with stock and variant validation.
- [ ] **Checkout & Payments**:
  - [ ] PayHere Sandbox payment gateway integration.
  - [ ] WhatsApp Order Integration (direct pre-formatted order summary submission).
- [ ] **Admin Panel**:
  - [ ] Protected admin authentication using JWT and bcryptjs.
  - [ ] Product and variant CRUD with stock management.
  - [ ] Order management and status updates.
- [ ] **Deployment**: CI/CD pipelines deploying frontend to Vercel and backend/database to Railway.
