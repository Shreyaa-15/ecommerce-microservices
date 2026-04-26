import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api'

export default function Login({ auth }) {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const handle = async () => {
    setLoading(true)
    setError('')
    try {
      const fn = mode === 'login' ? login : register
      const r  = await fn(form)
      auth.saveUser(r.data)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 380, margin: '4rem auto',
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 12, padding: '2rem'
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>
        {mode === 'login'
          ? 'Welcome back to shopify.'
          : 'Start shopping in seconds.'}
      </p>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '0.6rem 0.8rem',
          color: 'var(--red)', fontSize: 12, marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {mode === 'register' && (
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
            Name
          </label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
      )}

      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
          Password
        </label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder="••••••••"
          style={inputStyle}
        />
      </div>

      <button onClick={handle} disabled={loading} style={{
        width: '100%', background: 'var(--accent)',
        color: '#fff', border: 'none', borderRadius: 8,
        padding: '0.7rem', fontSize: 14, fontWeight: 500,
        opacity: loading ? 0.7 : 1
      }}>
        {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 12, color: 'var(--muted)' }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12 }}
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem',
  border: '1px solid var(--border)', borderRadius: 8,
  fontSize: 13, color: 'var(--text)', outline: 'none',
  background: '#fff'
}