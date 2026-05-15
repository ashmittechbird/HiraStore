# The Hira Store

A luxury silver jewelry e-commerce storefront built with React + Vite, backed by Frappe/ERPNext for inventory, orders, and customers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| State | Zustand (cart, wishlist) |
| Backend | Node.js `server.js` — auth API + ERPNext proxy |
| ERP | Frappe/ERPNext 15 (`hira-bench`, port 8001) |
| Styling | Inline CSS-in-JS per component |
| Deployment | Frappe www pages + React SPA served at `/store/` |

---

## Project Structure

```
HiraStore/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── shop/             # Full catalog with filters
│   │   ├── product/[id]/     # Product detail
│   │   ├── cart/             # Cart (Zustand + localStorage)
│   │   ├── wishlist/         # Wishlist
│   │   ├── checkout/         # Checkout form
│   │   ├── payment/          # Payment step
│   │   ├── order-success/    # Order confirmation
│   │   ├── login/            # Login
│   │   ├── signup/           # Signup
│   │   ├── account/          # User account & orders
│   │   ├── about/            # Brand story
│   │   └── admin/            # Admin panel (ERPNext dashboard)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── store/
│   │   ├── cart.ts           # Zustand cart store
│   │   └── wishlist.ts       # Zustand wishlist store
│   └── lib/
│       └── api.ts            # ERPNext + auth API client
├── catalog_images/           # Local product image assets
├── server.js                 # Node.js dev server (port 5500)
├── vite.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Frappe bench running at `localhost:8001` (hira-bench)
- ERPNext API key/secret configured in `server.js`

### Local Development (server.js)

> **Important:** Always run builds from the Linux path, not the Windows (`/mnt/c/...`) path — WSL cannot `chmod` on NTFS.

**Linux build directory:** `/home/frappenew_user/hirastore-build/`

```bash
# 1. Sync source from Windows to Linux build dir
rsync -av /mnt/c/Users/ashmi/OneDrive/Desktop/HiraStore/src/ /home/frappenew_user/hirastore-build/src/
rsync -av /mnt/c/Users/ashmi/OneDrive/Desktop/HiraStore/vite.config.ts \
          /mnt/c/Users/ashmi/OneDrive/Desktop/HiraStore/index.html \
          /home/frappenew_user/hirastore-build/

# 2. Build
cd /home/frappenew_user/hirastore-build
npm run build

# 3. Start server
node server.js
```

App runs at: **`http://localhost:5500/store`**

### Frappe Build (deploy to hira-bench)

```bash
cd /home/frappenew_user/hirastore-build
npm run build:frappe

# Copy built assets to Frappe public dir
cp -r dist/* /home/frappenew_user/hira-bench/apps/hira/hira/public/hirastore/
bench --site hirastore.local build
```

App runs at: **`http://localhost:8001/store`**

---

## Routes

| Path | Description |
|------|-------------|
| `/store/` | Homepage — hero, bestsellers, new arrivals |
| `/store/shop` | Full catalog with category/price filters |
| `/store/product/:id` | Product detail page |
| `/store/cart` | Shopping cart |
| `/store/wishlist` | Saved items |
| `/store/checkout` | Checkout form |
| `/store/payment` | Payment (Square) |
| `/store/order-success` | Order confirmation |
| `/store/login` | Login |
| `/store/signup` | Signup |
| `/store/account` | User account & order history |
| `/store/about` | Brand story |
| `/store/admin` | Admin panel |

---

## API (server.js)

`server.js` runs on port 5500 and handles:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Frappe session login → returns JWT-style token |
| `/api/auth/signup` | POST | Creates Frappe User + ERPNext Customer |
| `/api/auth/logout` | POST | Invalidates session |
| `/api/auth/me` | GET | Current session info |
| `/api/orders/create` | POST | Creates ERPNext Sales Order |
| `/api/customer/orders` | GET | Lists orders for logged-in user |
| `/api/customer/profile` | POST | Updates shipping address |
| `/api/homepage/sections` | GET/POST | Curated homepage product lists |
| `/api/offers` | GET | Active coupon codes |
| `/api/coupon/validate` | POST | Validates coupon + calculates discount |
| `/erp/*` | proxy | Passes requests to ERPNext at port 8001 |

---

## Admin Panel

Access at `/store/admin`. Connects directly to ERPNext using API key/secret stored in `localStorage` (`hs_admin_cfg`).

Default ERPNext credentials (configure in Settings tab):
- **URL:** `http://127.0.0.1:8001`
- **API Key:** `df4ffcff00dcb5d`
- **API Secret:** `054316891a5f19f`

Features: product CRUD, order management, customer list, homepage curation, coupon codes.

---

## Product Catalog

Products are sourced from ERPNext Items. When ERPNext is unreachable, all pages fall back to:

```
/assets/hira/catalog_images/products.json
```

Local images are served from `catalog_images/` (server.js) or `/assets/hira/catalog_images/` (Frappe).

---

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5500` | server.js listen port |
| `ERP_HOST` | `127.0.0.1` | ERPNext host |
| `ERP_PORT` | `8001` | ERPNext port |
| `ERP_API_KEY` | see server.js | ERPNext API key |
| `ERP_API_SECRET` | see server.js | ERPNext API secret |
| `VITE_CATALOG_BASE` | `/catalog_images` | Image base for Frappe builds |
