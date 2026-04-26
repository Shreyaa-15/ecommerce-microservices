import { useState } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product_id: product.id, name: product.name,
                         price: product.price, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) =>
    setCart(prev => prev.filter(i => i.product_id !== productId))

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId)
    setCart(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity: qty } : i
    ))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, total }
}