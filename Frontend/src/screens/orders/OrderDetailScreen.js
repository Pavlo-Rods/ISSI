/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import { brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { getOrderDetail } from '../../api/OrderEndpoints'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import ImageCard from '../../components/ImageCard'
import { FlatList, Image } from 'react-native-web'

// FR6:o Un cliente podrá consultar los detalles de sus pedidos. El sistema debe proporcionar todos los
// detalles de un pedido, incluidos los productos solicitados y sus precios.
export default function OrderDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [order, setOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    async function fetchOrderDetails () {
      try {
        const fetchedOrder = await getOrderDetail(route.params.id)
        setOrder(fetchedOrder)
        setRestaurant(fetchedOrder.restaurant)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order the details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle

        })
      }
    }
    fetchOrderDetails()
  }, [loggedInUser, route])

  const renderHeader = () => {
    return (
      <View style = { styles.restaurantHeaderContainer}>
          <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
          <TextSemiBold textStyle={styles.headerText}>Order:
          {order.id}</TextSemiBold>
          <TextRegular textStyle={styles.headerText}>Created at:
          {order.createdAt}</TextRegular>
          {order.startedAt && <TextRegular textStyle={styles.headerText}>Started at: {order.startedAt}</TextRegular>}
          <TextRegular textStyle={styles.headerText}>Total Price: {route.params.totalPrice} €</TextRegular>
          <TextRegular textStyle={styles.headerText}>Address: {order.address}</TextRegular>
          <TextRegular textStyle={styles.headerText}>Shipping costs: {order.shippingCosts} €</TextRegular>
         <TextRegular textStyle={styles.headerText}>Status: {order.status}</TextRegular>
      </View>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular style ={styles.emptyList}>
        No products can be shown. Please order some products
      </TextRegular>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
       imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
       title={item.name}
       >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold> Unity Price :<TextRegular textStyle={styles.price}>{item.price.toFixed(2)}</TextRegular></TextSemiBold>
        <TextSemiBold> Quantity :<TextRegular textStyle={styles.quantity}>{item.OrderProducts.quantity}</TextRegular></TextSemiBold>
        <TextSemiBold> Total Price :<TextRegular>{(item.price.toFixed(2)) * item.OrderProducts.quantity}€</TextRegular></TextSemiBold>
       </ImageCard>
    )
  }
  return (
    <FlatList
    ListHeaderComponent={renderHeader}
    ListEmptyComponent={renderEmptyProductsList}
    style={styles.container}
    data={order.products}
    renderItem={renderProduct}
    keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  // DONE: remove this style and the related <View>. Only for clarification purposes
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    marginBottom: 5,
    marginTop: 1
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
