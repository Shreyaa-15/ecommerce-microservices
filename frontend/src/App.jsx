import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import Home    from './pages/Home'
import Cart    from './pages/Cart'
import Orders  from './pages/Orders'
import Login   from './pages/Login'
import Navbar  from './components/Navbar'

export default function App() {
  const auth = useAuth()
  const cart = useCart()

  return (
    <BrowserRouter>
      <Navbar auth={auth} cartCount={cart.cart.length} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Routes>
          <Route path="/"       element={<Home auth={auth} cart={cart} />} />
          <Route path="/cart"   element={<Cart auth={auth} cart={cart} />} />
          <Route path="/orders" element={<Orders auth={auth} />} />
          <Route path="/login"  element={<Login auth={auth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}