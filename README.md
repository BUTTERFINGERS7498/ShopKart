# ShopKart

A full-stack e-commerce app built for the ShopKart Full-Stack Lab Project. Customers can register, browse products, keep a wishlist, manage a cart, and pay for orders with Razorpay (test mode).

## Tech stack

- **Frontend:** React 19, React Router 7, Axios, Vite
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT stored in an HTTP-only cookie, passwords hashed with bcrypt
- **Payments:** Razorpay Checkout (test mode), with server-side signature verification

## Features

- Register, log in, log out, view profile, change password
- Product listing with search, and product detail pages
- Wishlist: add, remove, toggle
- Cart: add items, change quantity, remove items
- Checkout with shipping address and Razorpay payment
- Order history and order details
- Order totals are calculated on the server from current product prices, never trusted from the client

## Project structure

```
ShopKraft/
├── backend/
│   ├── config/          Razorpay client
│   ├── controllers/     Route handlers
│   ├── middlewares/     JWT auth middleware
│   ├── models/          Customer, Product, Order schemas
│   ├── routes/          Express routers
│   ├── utils/           Token helper
│   ├── index.js         Server entry point
│   ├── seed.js          Adds sample products
│   └── _memory-server.js  Runs the API on an in-memory MongoDB (no install needed)
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/     Cart state
    │   ├── pages/
    │   ├── services/    Axios instance
    │   └── utils/
    └── vite.config.js   Dev server + API proxy to the backend
```

## Prerequisites

- Node.js 18 or newer
- MongoDB, either installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. If you have neither, see [Running without MongoDB installed](#running-without-mongodb-installed).
- A [Razorpay](https://dashboard.razorpay.com) account for test API keys (only needed for checkout)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ShopKraft

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Backend port. Defaults to `5000`. The frontend proxy expects `5000`. |
| `MONGO_URI` | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/shopkart` or an Atlas `mongodb+srv://...` URI |
| `JWT_SECRET` | Any long random string used to sign login tokens |
| `NODE_ENV` | `development` locally |
| `CLIENT_ORIGIN` | Frontend URL allowed by CORS. Defaults to `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay test Key ID (`rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Razorpay test Key Secret |

To get Razorpay keys: log in to the Razorpay Dashboard, switch to **Test Mode**, open **Account & Settings → API Keys**, and click **Generate Test Key**.

### 3. Add sample products

```bash
cd backend
npm run seed
```

### 4. Start the app

In one terminal:

```bash
cd backend
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), register an account, and start shopping.

## Running without MongoDB installed

The backend can start its own temporary in-memory MongoDB. It seeds the sample products automatically:

```bash
cd backend
npm run dev:memory
```

The first run downloads a MongoDB binary, so it can take a minute. All data is lost when the server stops. You still need `JWT_SECRET` (and the Razorpay keys for checkout) in `backend/.env`.

## Testing payments

Razorpay is in test mode, so no real money moves. At checkout, use a card from [Razorpay's test card list](https://razorpay.com/docs/payments/payments/test-card-details/) or the UPI ID `success@razorpay`.

## API reference

All routes except register, login, and the product routes require the auth cookie.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/customers/register` | Create an account |
| POST | `/customers/login` | Log in |
| GET | `/customers/me` | Current customer profile |
| POST | `/customers/logout` | Log out |
| PATCH | `/customers/change-password` | Change password |
| GET | `/products` | List products |
| GET | `/products/:id` | Product details |
| POST | `/products` | Create a product |
| GET | `/wishlist` | Get wishlist |
| POST | `/wishlist/:productId` | Add to wishlist |
| DELETE | `/wishlist/:productId` | Remove from wishlist |
| PATCH | `/wishlist/:productId/toggle` | Toggle wishlist item |
| GET | `/cart` | Get cart |
| POST | `/cart/:productId` | Add to cart |
| PATCH | `/cart/:productId` | Update quantity |
| DELETE | `/cart/:productId` | Remove from cart |
| POST | `/orders/create-payment-order` | Create an order and a Razorpay payment order |
| POST | `/orders/verify-payment` | Verify the Razorpay signature and mark the order paid |
| GET | `/orders` | My orders |
| GET | `/orders/:id` | Order details |

## Security notes

- `.env` files are git-ignored. Only `backend/.env.example` with placeholder values is committed.
- The Razorpay Key Secret is only used on the server.
