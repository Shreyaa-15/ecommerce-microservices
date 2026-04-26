import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../api'

export default function Cart({ auth, cart }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!auth.user) return navigate('/login')
    if (cart.cart.length === 0) return

    setLoading(true)
    setError('')
    try {
      await createOrder({
        user_id: auth.user.user_id,
        items: cart.cart.map(i => ({
          product_id: i.product_id,
          quantity:   i.quantity
        }))
      })
      cart.clearCart()
      navigate('/orders')
    } catch (e) {
      setError(e.response?.data?.detail || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  if (cart.cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>🛒</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
        Your cart is empty
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Add some products to get started
      </p>
      <button onClick={() => navigate('/')} style={btnStyle}>
        Browse products
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.5rem' }}>
        Your cart ({cart.cart.length} items)
      </h1>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '0.6rem 0.8rem',
          color: 'var(--red)', fontSize: 12, marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
        {cart.cart.map(item => (
          <div key={item.product_id} style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 10, padding: '1rem',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                ${item.price.toFixed(2)} each
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)}
                  style={qtyBtn}
                >−</button>
                <span style={{ fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)}
                  style={qtyBtn}
                >+</button>
              </div>
              <span style={{ fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => cart.removeFromCart(item.product_id)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16 }}
              >×</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '1.2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 2 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            ${cart.total.toFixed(2)}
          </div>
        </div>
        <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
          {loading ? 'Placing order...' : 'Checkout →'}
        </button>
      </div>
    </div>
  )
}

const btnStyle = {
  background: 'var(--accent)', color: '#fff',
  border: 'none', borderRadius: 8,
  padding: '0.7rem 1.5rem', fontSize: 14,
  fontWeight: 500, cursor: 'pointer'
}

const qtyBtn = {
  width: 28, height: 28,
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 6, fontSize: 16,
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer'
}