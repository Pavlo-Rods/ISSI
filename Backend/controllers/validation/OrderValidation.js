const { check } = require('express-validator')
const models = require('../../models')
const Product = models.Product
const Order = models.Order
const Restaurant = models.Restaurant

const checkOrderPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt']
      })
    if (order.startedAt) {
      return Promise.reject(new Error('The order has already been started'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
const checkOrderCanBeSent = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt', 'sentAt']
      })
    if (!order.startedAt) {
      return Promise.reject(new Error('The order is not started'))
    } else if (order.sentAt) {
      return Promise.reject(new Error('The order has already been sent'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
const checkOrderCanBeDelivered = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId,
      {
        attributes: ['startedAt', 'sentAt', 'deliveredAt']
      })
    if (!order.startedAt) {
      return Promise.reject(new Error('The order is not started'))
    } else if (!order.sentAt) {
      return Promise.reject(new Error('The order is not sent'))
    } else if (order.deliveredAt) {
      return Promise.reject(new Error('The order has already been delivered'))
    } else {
      return Promise.resolve('ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}
module.exports = {
  // DONE: Include validation rules for create that should:
  // 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
  // 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0 *
  // 4. Check that all the products belong to the same restaurant *
  create: [
    check('restaurantId').exists().isInt({ min: 1 }).toInt()
      .custom(async (value) => {
        const restaurant = await Restaurant.findByPk(value)
        if (!restaurant) {
          throw new Error('restaurantId does not correspond to an existing restaurant')
        }
      }),
    check('products').isArray({ min: 1 })
      .withMessage('products is either an empty array or is not an array at all')
      .custom((value) => {
        return value.every((element) => element.productId > 0 && element.quantity > 0)
      })
      .withMessage('products is not composed of objects with productId and quantity greater than 0'),
    check('products').custom(async (value, { req }) => {
      const restaurantId = req.body.restaurantId || (await Order.findByPk(req.params.orderId)).restaurantId
      const productIds = value.map(element => element.productId)
      const products = await Product.findAll({ where: { id: productIds } })
      for (const product of products) {
        if (product.restaurantId !== restaurantId || !product.availability) {
          throw new Error('some or all products are not available or do not belong to the same restaurant')
        }
      }
      return true
    }),
    check('products.*.quantity').custom((value) => {
      if (value <= 0) {
        throw new Error('quantity must be greater than 0')
      }
      return true
    }),
    check('products').custom((value) => {
      const restaurantId = value[0].restaurantId
      return value.every((element) => element.restaurantId === restaurantId)
    })
      .withMessage('all products must belong to the same restaurant')
  ],
  // DONE: Include validation rules for update that should:
  // 1. Check that restaurantId is NOT present in the body.
  // 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
  // 3. Check that products are available
  // 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
  // 5. Check that the order is in the 'pending' state.
  update: [
    check('restaurantId').custom(async (value, { req }) => {
      try {
        const order = await Order.findByPk(req.params.orderId)
        if (value === undefined || value === null || value === order.restaurantId) {
          return true
        } else {
          throw new Error('You cannot change the restaurant')
        }
      } catch (err) {
        throw new Error('You cannot change the restaurant')
      }
    }),
    check('products').custom((value, { req }) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('products is either an empty array or is not an array at all')
      }
      for (const element of value) {
        if (element.productId <= 0 || element.quantity <= 0) {
          throw new Error('products is not composed of objects with productId and quantity greater than 0')
        }
      }
      return true
    }),
    check('startedAt').custom(async (value, { req }) => {
      try {
        const order = await Order.findByPk(req.params.orderId)
        if (order.startedAt === undefined || order.startedAt === null) {
          return true
        } else {
          throw new Error('this order is already pending')
        }
      } catch (err) {
        throw new Error('this order cannot be updated')
      }
    })
  ],
  // DONE: Include validation rules for destroying an order that should check if the order is in the 'pending' state
  destroy: [
    check('id').custom(checkOrderPending)
  ],
  confirm: [
    check('startedAt').custom(checkOrderPending)
  ],
  send: [
    check('sentAt').custom(checkOrderCanBeSent)
  ],
  deliver: [
    check('deliveredAt').custom(checkOrderCanBeDelivered)
  ]
}
