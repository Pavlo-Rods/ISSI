import React, { useEffect, useContext, useState } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemibold from '../../components/TextSemibold'
import { brandPrimary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import DeleteModal from '../../components/DeleteModal'
import { getMyOrders, deleteOrder } from '../../api/OrderEndpoints'
import { FlatList } from 'react-native-web'
import ImageCard from '../../components/ImageCard'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  // FR5: Listing my confirmed orders. A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.
  // FR8: Edit/delete orderIf the order is in the state pending, the customer can edit or remove the products included or remove the whole order. The delivery address can also be modified in the state pending. If the order is in the state sent or delivered no edition is allowed.

  useEffect(() => {
    fetchOrders()
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  const fetchOrders = async function fetchOrders () {
    try {
      const fetchedOrders = await getMyOrders()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the orders. ${error}`,
        type: 'error',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    }
  }

  const renderOrders = ({ item }) => {
    return (
      <ImageCard style={{ flexDirection: 'row' }}
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id, products: item.products, totalPrice: item.price + item.shippingCosts })
        }}
      >
        <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column' }}>
        <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
        <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
        <TextSemibold>Price: <TextRegular style={{ color: brandPrimary }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Status: <TextRegular style={{ color: brandPrimary }}>{item.status}</TextRegular></TextSemibold>
        <TextSemibold>Total Price: <TextRegular style={{ color: brandPrimary }}>{item.price + item.shippingCosts} €</TextRegular></TextSemibold>
        </View>
        {item.status === 'pending' && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
            <Pressable
            onPress={() => navigation.navigate('EditOrderDetailScreen', { id: item.id, restaurantId: item.restaurantId })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.buttonEdit
            ]}>
              <TextSemibold textStyle={{ color: 'white', fontSize: 15 }}>Edit
                </TextSemibold>
            </Pressable>
            <View style={{ marginLeft: '10px' }}>
            <Pressable
            onPress={() => (setOrderToBeDeleted(item))
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.buttonDelete
            ]}>
              <TextSemibold textStyle={{ color: 'white', fontSize: 15 }}>Delete</TextSemibold>
            </Pressable>
            </View>
          </View>
        )}
      </ImageCard>
    )
  }

  const renderEmptyOrder = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Are you logged in?
      </TextRegular>
    )
  }

  const removeOrder = async (order) => {
    try {
      await deleteOrder(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrders}
        ListEmptyComponent={renderEmptyOrder}
        keyExtractor={item => item.id.toString()}
        />
    <DeleteModal
      isVisible={orderToBeDeleted !== null}
      onCancel={() => setOrderToBeDeleted(null)}
      onConfirm={() => removeOrder(orderToBeDeleted)}>
      <TextRegular>This order will be deleted</TextRegular>
  </DeleteModal>
  </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 0,
    padding: 10,
    alignSelf: 'right',
    flexDirection: 'row',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  button: {
    borderRadius: 8,
    height: 40,
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
  textTitle: {
    fontSize: 18,
    color: 'white',
    paddingTop: 20
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  buttonDelete: {
    padding: 10,
    borderRadius: 8,
    flexDirection: 'column',
    alignContent: 'flex-end',
    alignSelf: 'flex-end'
  },
  buttonEdit: {
    padding: 10,
    borderRadius: 8,
    alignContent: 'flex-end',
    alignSelf: 'flex-end'
  }
})
