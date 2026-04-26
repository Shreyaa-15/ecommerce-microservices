import { useEffect, useState } from 'react'
import { getProducts } from '../api'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['all', 'electronics', 'books', 'footwear', 'home', 'fitness']

export default function Home({ auth, cart }) {
  const [products, setProducts]   = useState([])
  const [category, setCategory]   = useState('all')
  const [loading, setLoading]     = useState(true)
  const [added, setAdded]         = useState(null)

  useEffect(() => {
    setLoading(true)
    getProducts(category === 'all' ? null : category)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }, [category])

  const handleAdd = (product) => {
    cart.addToCart(product)
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '2.5rem',
        marginBottom: '2rem', textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 32, fontWeight: 700,
          letterSpacing: '-0.03em', marginBottom: 8
        }}>
          Everything you need,
          <span style={{ color: 'var(--accent)' }}> delivered.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          Built on microservices · Kafka event bus · Docker + Kubernetes
        </p>
      </div>

      {/* Category filters */}
      <div style={{
        display: 'flex', gap: 8,
        marginBottom: '1.5rem', flexWrap: 'wrap'
      }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12,
            background: category === c ? 'var(--accent)' : 'var(--surface)',
            color: category === c ? '#fff' : 'var(--muted)',
            border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'all 0.15s', fontWeight: category === c ? 500 : 400
          }}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Toast notification */}
      {added && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--text)', color: '#fff',
          borderRadius: 8, padding: '0.6rem 1rem',
          fontSize: 13, zIndex: 1000,
          animation: 'slideIn 0.2s ease'
        }}>
          ✓ Added to cart
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              height: 280, borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s infinite',
              animationDelay: `${i * 0.05}s`
            }}/>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}