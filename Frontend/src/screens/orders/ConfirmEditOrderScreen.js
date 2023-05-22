import React, { useState, useEffect } from 'react'
import { StyleSheet, FlatList, ScrollView, View, Pressable, Image } from 'react-native'
import * as yup from 'yup'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { Formik } from 'formik'
import { updateOrder } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import ImageCard from '../../components/ImageCard'
import TextSemibold from '../../components/TextSemibold'
import InputItem from '../../components/InputItem'
import { getDetail } from '../../api/RestaurantEndpoints'

export default function ConfirmOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  const [restaurant, setRestaurant] = useState({})
  const initialOrderValues = { address: '', shippingCosts: route.params.shippingCosts, restaurantId: route.params.restaurantId, products: [] }

  let totalPrice = 0.0
  for (const precio of route.params.price) {
    totalPrice += precio
  }

  useEffect(() => {
    async function fetchProducts () {
      try {
        const restaurante = await getDetail(route.params.restaurantId)
        setProducts(restaurante.products)
        setRestaurant(restaurante)
        for (let index = 0; index < route.params.quantities.length; ++index) {
          if (route.params.quantities[index] > 0) {
            const product = { productId: restaurante.products[index].id, quantity: route.params.quantities[index] }
            initialOrderValues.products.push(product)
          }
        }
      } catch (error) {
        showMessage({
          message: `There was a problem while retrieving the products. ${error}`
        })
      }
    }
    fetchProducts()
  }, [route])

  const validationSchema = yup.object().shape({
    address: yup.string().max(75, 'Address too long').required('Address is required.'),
    products: yup.array(yup.object({ quantity: yup.number().required().min(0).integer() }))
  })

  const renderHeader = () => {
    return (
      <View style={styles.restaurantHeaderContainer}>
        <TextRegular textStyle = {{ textAlign: 'left', fontSize: 18, color: 'white' }}>Please, confirm or dismiss your order right below</TextRegular>
        <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
        <TextRegular textStyle={styles.textTitle}>Total Price: {totalPrice} €</TextRegular>
      </View>
    )
  }

  const renderProduct = ({ item, index }) => {
    if (route.params.quantities[index] > 0) {
      return (
        <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemibold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemibold>
        <View>
          <TextRegular>Cantidad: <TextRegular>{route.params.quantities[index]}</TextRegular>
            <TextRegular textStyle={{ paddingLeft: 50 }}>Precio total: <TextSemibold>{route.params.price[index]} €</TextSemibold></TextRegular>
          </TextRegular>
        </View>
      </ImageCard>
      )
    }
  }

  const updatingOrder = async (values) => {
    setBackendErrors([])
    try {
      const updatedOrder = await updateOrder(route.params.id, values)
      showMessage({
        message: `Order ${updatedOrder.id} successfully updated. Go to My Orders to check it out!`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        textStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <FlatList
      style={styles.list}
      renderItem={renderProduct}
      data={products}
      ListHeaderComponent={renderHeader}
      />
      <Formik
          validationSchema={validationSchema}
          initialValues={initialOrderValues}
          onSubmit={updatingOrder}>
          {({ handleSubmit, setFieldValue, values, isValid }) => (
          <ScrollView>
            <InputItem
              name='address'
              label='Address'
              textContentType='text'
              placeholder='Please insert your address'
              onChangeText={text => setFieldValue('address', text)}
            />
              {backendErrors &&
            backendErrors.map((error, index) => <TextError key={index}>{error.params}{error.msg}</TextError>)
            }

          <Pressable
            onPressIn={() => {
              handleSubmit()
            }}
            onPress={() => {
              navigation.popToTop()
            }}

            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandSuccessTap
                  : GlobalStyles.brandSuccess
              },
              {
                backgroundColor: !isValid
                  ? GlobalStyles.brandSuccessDisabled
                  : GlobalStyles.brandSuccess
              },
              styles.button]}
          >
            <TextRegular textStyle={styles.text}>Confirm</TextRegular>
          </Pressable>
          <Pressable
            onPress = {() => {
              navigation.goBack()
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? '#85929E'
                  : '#AEB6BF'
              },
              styles.button
            ]}
          >
          <TextRegular textStyle={{ color: 'white', fontSize: 16 }}>Discard</TextRegular>
        </Pressable>
        </ScrollView>
          )}
        </Formik>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 200,
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
    marginTop: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 18,
    color: 'white',
    paddingTop: 20
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
    color: GlobalStyles.brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
