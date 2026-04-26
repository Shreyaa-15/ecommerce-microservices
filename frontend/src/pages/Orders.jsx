import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserOrders, getPayment } from '../api'

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  paid:      { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  shipped:   { bg: '#dbeafe', color: '#1e40af' },
}

export default function Orders({ auth }) {
  const [orders, setOrders]     = useState([])
  const [payments, setPayments] = useState({})
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.user) return navigate('/login')
    getUserOrders(auth.user.user_id)
      .then(async r => {
        setOrders(r.data)
        const paymentMap = {}
        await Promise.all(r.data.map(async order => {
          try {
            const p = await getPayment(order.id)
            paymentMap[order.id] = p.data
          } catch { }
        }))
        setPayments(paymentMap)
      })
      .finally(() => setLoading(false))
  }, [auth.user])

  if (loading) return (
    <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading orders...</div>
  )

  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>📦</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No orders yet</h2>
      <button onClick={() => navigate('/')} style={{
        background: 'var(--accent)', color: '#fff',
        border: 'none', borderRadius: 8,
        padding: '0.7rem 1.5rem', fontSize: 14, fontWeight: 500
      }}>
        Start shopping
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.5rem' }}>
        Your orders
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => {
          const payment = payments[order.id]
          const colors  = STATUS_COLORS[order.status] || STATUS_COLORS.pending

          return (
            <div key={order.id} style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 12, padding: '1.2rem'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>
                    Order #{order.id}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    ...colors, fontSize: 11, fontWeight: 500,
                    borderRadius: 4, padding: '3px 8px'
                  }}>
                    {order.status}
                  </span>
                  {payment && (
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      borderRadius: 4, padding: '3px 8px',
                      background: payment.status === 'success' ? '#d1fae5' : '#fee2e2',
                      color: payment.status === 'success' ? '#065f46' : '#991b1b'
                    }}>
                      Payment: {payment.status}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, color: 'var(--text)'
                  }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ color: 'var(--muted)' }}>
                      ${item.line_total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.8rem',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}