import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ auth, cartCount }) {
  const navigate = useNavigate()

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 56,
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{
        fontWeight: 600, fontSize: 16,
        letterSpacing: '-0.02em', color: 'var(--text)'
      }}>
        shopify<span style={{ color: 'var(--accent)' }}>.</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ color: 'var(--muted)', fontSize: 13 }}>
          Products
        </Link>
        {auth.user && (
          <Link to="/orders" style={{ color: 'var(--muted)', fontSize: 13 }}>
            Orders
          </Link>
        )}
        <Link to="/cart" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--text)', fontSize: 13
        }}>
          Cart
          {cartCount > 0 && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, fontWeight: 600
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        {auth.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {auth.user.name}
            </span>
            <button onClick={() => { auth.logout(); }}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '5px 12px',
                fontSize: 12, color: 'var(--text)'
              }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{
            background: 'var(--accent)', color: '#fff',
            borderRadius: 6, padding: '6px 14px',
            fontSize: 12, fontWeight: 500
          }}>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}