import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './app/page'
import Shop from './app/shop/page'
import Cart from './app/cart/page'
import Login from './app/login/page'
import Signup from './app/signup/page'
import Account from './app/account/page'
import Wishlist from './app/wishlist/page'
import About from './app/about/page'
import Checkout from './app/checkout/page'
import Payment from './app/payment/page'
import OrderSuccess from './app/order-success/page'
import Product from './app/product/[id]/page'
import Admin from './app/admin/page'

// Empty string = same origin (works in Frappe context and with Vite proxy in dev)
const FRAPPE_URL = (import.meta.env.VITE_FRAPPE_URL as string) || ''

export default function App() {
  return (
    <FrappeProvider url={FRAPPE_URL} enableSocket={false}>
    <BrowserRouter basename="/store">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
    </FrappeProvider>
  )
}
