const CATEGORY_COLORS = {
  electronics: '#2563eb',
  books:       '#7c3aed',
  footwear:    '#db2777',
  home:        '#059669',
  fitness:     '#d97706',
}

export default function ProductCard({ product, onAddToCart }) {
  const color = CATEGORY_COLORS[product.category] || '#6b7280'

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
      transition: 'box-shadow 0.15s',
      cursor: 'pointer'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Image placeholder */}
      <div style={{
        height: 160, background: `${color}10`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 40
      }}>
        {product.category === 'electronics' ? '💻'
          : product.category === 'books' ? '📚'
          : product.category === 'footwear' ? '👟'
          : product.category === 'home' ? '🏠'
          : product.category === 'fitness' ? '🏋️'
          : '📦'}
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{
            fontSize: 10, color,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 4, padding: '2px 6px',
            letterSpacing: '0.04em'
          }}>
            {product.category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {product.stock} left
          </span>
        </div>

        <h3 style={{
          fontSize: 14, fontWeight: 500,
          margin: '0.5rem 0 0.3rem',
          color: 'var(--text)'
        }}>
          {product.name}
        </h3>

        <p style={{
          fontSize: 12, color: 'var(--muted)',
          marginBottom: '0.8rem', lineHeight: 1.4
        }}>
          {product.description}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: 16, fontWeight: 600,
            color: 'var(--text)'
          }}>
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? 'var(--surface2)' : 'var(--accent)',
              color: product.stock === 0 ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 7,
              padding: '6px 14px', fontSize: 12,
              fontWeight: 500, transition: 'background 0.15s'
            }}
          >
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}