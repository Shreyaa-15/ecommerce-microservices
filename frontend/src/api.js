import axios from 'axios'

const api = axios.create({ baseURL: '' })

const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const register = (data) =>
  api.post('/auth/register', data)

export const login = (data) =>
  api.post('/auth/login', data)

export const getProducts = (category) =>
  api.get(`/products/${category ? `?category=${category}` : ''}`)

export const getProduct = (id) =>
  api.get(`/products/${id}`)

export const createOrder = (data) =>
  api.post('/orders/', data, { headers: authHeader() })

export const getUserOrders = (userId) =>
  api.get(`/orders/user/${userId}`, { headers: authHeader() })

export const getPayment = (orderId) =>
  api.get(`/payments/order/${orderId}`, { headers: authHeader() })