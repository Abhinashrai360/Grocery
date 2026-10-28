# GreenCart: MERN Grocery Delivery

Fresh-grocery e-commerce app: storefront, cart, checkout (COD + optional Razorpay), order history and a seller panel.

## Architecture

```
React 19 + Vite + Tailwind 4 (Context API)
        |  axios, httpOnly cookie JWT
        v
Express 5 API:  routes -> middlewares (authUser / authSeller / rateLimit) -> controllers -> Mongoose models
        |                                                              \
        v                                                               v
MongoDB (users, products, addresses, orders, subscribers)     Cloudinary (images) + Razorpay (optional)
```

Trust rules enforced on the server:
- The user id always comes from the signed cookie (`req.user.userId`), never from the request body.
- Prices, tax, availability and totals are recalculated from the database on every order. The client only sends product ids, quantities and an address id.
- Addresses are checked to belong to the logged-in user; cart data is sanitised.
- Seller routes need the seller cookie; auth runs before file uploads.
- Login/register/seller-login/newsletter are rate limited; CORS is limited to `CLIENT_URL`.

## Setup (Windows: double-click scripts)

1. **`setup.bat`**: creates `server\.env` and `client\.env` from the examples and runs `npm install` in both folders.
2. Open **`server\.env`** in Notepad and fill in `MONGODB_URI`, `JWT_SECRET` (any long random text), `SELLER_EMAIL`, `SELLER_PASSWORD` and the three `CLOUDINARY_*` keys.
3. **`start.bat`**: starts the API (http://localhost:5000) and the website (http://localhost:5173).
4. **`fix-images.bat`**: shows what is stored in your product images and uploads the sample images (`client\src\assets`) to your Cloudinary, repairing broken products.

> Old PowerShell does not understand `&&`. Run commands one per line, or use the .bat files above.

Manual way:

```bash
cd server
copy .env.example .env      # then fill it in
npm install
npm run server

cd ../client
copy .env.example .env
npm install
npm run dev
```

Products are added from the seller panel at `/seller` (login with `SELLER_EMAIL` / `SELLER_PASSWORD`).
If you have old products whose `category` is an array, run `npm run migrate:category` once in `server/`.

### Razorpay (optional)
Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (use `rzp_test_...` keys while testing); the "Online Payment" option then appears in the cart.
Flow: `POST /api/order/razorpay` creates the order -> Razorpay Checkout popup -> `POST /api/order/razorpay/verify` checks the payment signature and marks the order paid.
Recommended safety net: in Razorpay Dashboard -> Webhooks add `POST https://<your-api>/api/order/razorpay-webhook` (events: `payment.captured`, `order.paid`) and put the secret in `RAZORPAY_WEBHOOK_SECRET`.
Test card: any Razorpay test card, e.g. `4111 1111 1111 1111`, any future expiry, any CVV.

## API

| Area | Endpoints |
|---|---|
| User | `POST /api/user/register`, `POST /login`, `GET /is-auth`, `POST /logout` |
| Seller | `POST /api/seller/login`, `GET /is-auth`, `GET /logout` |
| Products | `GET /api/product/list`, `GET /id?id=`, seller: `POST /add`, `POST /stock` |
| Cart | `POST /api/cart/update` |
| Address | `POST /api/address/add`, `GET /get` |
| Orders | `GET /api/order/config`, `POST /cod`, `POST /razorpay`, `POST /razorpay/verify`, `GET /user`, seller: `GET /seller` |
| Newsletter | `POST /api/newsletter/subscribe` |
