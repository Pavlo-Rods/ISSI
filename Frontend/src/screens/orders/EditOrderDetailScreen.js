/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, ImageBackground } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import { getOrderDetail } from '../../api/OrderEndpoints'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import ImageCard from '../../components/ImageCard'
import { FlatList, Image } from 'react-native-web'
import defaultHeroImage from '../../../assets/heroImage.jpg'
import defaultProductImage from '../../../assets/product.jpeg'
import { getDetail } from '../../api/RestaurantEndpoints'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'

export default function EditOrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState()
  const [restaurant, setRestaurant] = useState({})
  const [precio, setPrecio] = useState([])
  const [quantities, setQuantities] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [isCreateOrderEnabled, setCreateOrderEnabled] = useState(false)

  useEffect(() => {
    async function fetchRestaurantDetail () {
      try {
        const order = await getOrderDetail(route.params.id)
        setOrder(order)
        const fetchedRestaurant = await getDetail(order.restaurantId)
        const cantidad = fetchedRestaurant.products.map(x => 0)
        setQuantities(cantidad)
        setPrecio(cantidad)
        setRestaurant(fetchedRestaurant)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order the details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchRestaurantDetail()
  }, [loggedInUser, route])

  useEffect(() => {
    const hasSelectedProduct = quantities.some(quantity => quantity > 0)
    setCreateOrderEnabled(hasSelectedProduct)
  }, [quantities])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : defaultHeroImage} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextSemiBold textStyle={styles.headerText}>OrderId: {route.params.id}</TextSemiBold>
          </View>
        </ImageBackground>
      </View>
    )
  }

  function updatePriceQuantity ({ quantity, index, item }) {
    // Updating the quantity
    const auxQuantity = [...quantities]
    auxQuantity[index] = parseInt(quantity)
    setQuantities(auxQuantity)
    // Updating the price
    const precioAux = [...precio]
    precioAux[index] = item.price * quantity
    setPrecio(precioAux)
  }
  function decreaseQuantity (index) {
    const currentQuantity = quantities[index] || 0
    const updatedPrice = [...precio]
    if (currentQuantity > 0) {
      const updatedQuantities = [...quantities]
      updatedQuantities[index] = currentQuantity - 1
      // multiplicamos por el precio del producto correspondiente
      updatedPrice[index] = updatedQuantities[index] * restaurant.products[index].price
      setQuantities(updatedQuantities)
      setPrecio(updatedPrice)
    }
  }

  const renderProduct = ({ item, index }) => {
    return (
      <View style={{ flex: 5, padding: 10 }}>
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        <View>
          <TextRegular>Cantidad: <TextSemiBold>{quantities[index] || 0} </TextSemiBold>
           <TextRegular textStyle={{ paddingLeft: 50 }}> Precio total: <TextSemiBold>{precio[index]} €</TextSemiBold></TextRegular>
           <Pressable onPress={() => updatePriceQuantity({ quantity: quantities[index] + 1, index, item })} style={styles.buttonQuantity}>
            <TextRegular style = {styles.buttonText}>+</TextRegular>
           </Pressable>
           <Pressable onPress={() => decreaseQuantity(index)} style={styles.buttonQuantity}>
            <TextRegular style = {styles.buttonText}>-</TextRegular>
           </Pressable>
              </TextRegular>
        </View>
      </ImageCard>
    </View>
    )
  }

  const renderFooter = () => {
    return (
      <Pressable
      disabled={!isCreateOrderEnabled}
        onPress={() => navigation.navigate('ConfirmEditOrderScreen', { quantities, price: precio, id: route.params.id, restaurantId: order.restaurantId })}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? brandPrimaryTap
              : brandPrimary,
            opacity: isCreateOrderEnabled ? 1 : 0.5
          },
          styles.button
        ]}>
        <TextRegular textStyle={styles.text}>
          Edit order
        </TextRegular>
      </Pressable>
    )
  }

  return (
    <>
    <View style={styles.header}>
      <FlatList ListHeaderComponent={renderHeader}/>
    </View>
    <View style={styles.container}>
      <FlatList showsVerticalScrollIndicator={false} data={restaurant.products} renderItem={renderProduct} keyExtractor={item => item.id.toString()}/>
    </View>
    <View style={styles.footer}>
      <FlatList ListFooterComponent={renderFooter}/>
    </View>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 2
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
  },
  restaurantHeaderContainer: {
    padding: 20,
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
    margin: 10
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
    marginTop: 10,
    marginBottom: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonQuantity: {
    backgroundColor: brandPrimary,
    borderRadius: 50,
    padding: 8,
    marginRight: 8,
    flexDirection: 'row'
  },
  buttonText: {
    color: 'yellow',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  input: {
    borderRadius: 8,
    height: 20,
    borderWidth: 1,
    padding: 15,
    marginTop: 10
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
