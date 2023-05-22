import { get, post, put, destroy } from './helpers/ApiRequestsHelper'

function getMyOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function updateOrder (id, data) {
  return put(`orders/${id}`, data)
}

function deleteOrder (id) {
  return destroy(`orders/${id}`)
}

export { getMyOrders, getOrderDetail, create, updateOrder, deleteOrder }
