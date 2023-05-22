/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Image, Pressable } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { brandPrimary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { getPopularOnes } from '../../api/ProductEndpoints'
import ImageCard from '../../components/ImageCard'
import { Text } from 'react-native-web'
import defaultLogo from '../../../assets/logo.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  // DONE: Create a state for storing the restaurants
  const [restaurants, setRestaurants] = useState([])
  const [popular, setPopular] = useState([])

  // RF1: Restaurants listing
  useEffect(() => {
    // DONE: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getRestaurants()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retriving restaurants. ${error}`,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    // DONE: set restaurants to state
    fetchRestaurants()
  }, [route])

  // RF7: Show up top 3 products
  useEffect(() => {
    async function fetchPopular () {
      try {
        const fetchedPopular = await getPopularOnes()
        setPopular(fetchedPopular)
      } catch (error) {
        showMessage({
          message: `There was an error while retriving restaurants.${error}`,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchPopular()
  }, [])
  // Representacion de cada elemento Restaurante
  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
      imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : defaultLogo}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.id })
      }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {((item.averageServiceMinutes === undefined || item.averageServiceMinutes === null) && <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>unknown min.</TextSemiBold></TextSemiBold>) ||
        ((item.averageServiceMinutes !== null || item.averageServiceMinutes !== undefined) && <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>)}
        <TextSemiBold>Shipping: <TextRegular style={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemiBold>
      </ImageCard>
    )
  }

  // Representacion de los productos populares
  const renderPopular = ({ item }) => {
    return (
      <View style ={styles.cardBody}>
        <Text style={styles.cardText}>{item.name}</Text>
        <Pressable style={styles.pressable} onPress={() => { navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId }) }}>
          <Image style={styles.image} source={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}/>
          <TextRegular numberOfLines={2}>{item.description}</TextRegular>
          <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}$</TextSemiBold>
        </Pressable>
      </View>
    )
  }

  const renderHeaderPopular = () => {
    return (
      <FlatList
        horizontal={true}
        style={{ flex: 1 }}
        data={popular}
        renderItem={renderPopular}
        />
    )
  }

  const renderEmptyRestaurant = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <>
    <View style={styles.products}>
      <FlatList ListHeaderComponent={renderHeaderPopular} scrollEnabled={false} showsVerticalScrollIndicator={false} />
    </View>
    <View style={styles.restaurants}>
      <FlatList data={restaurants} renderItem={renderRestaurant} ListEmptyComponent={renderEmptyRestaurant} showsVerticalScrollIndicator={false}/>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  // DONE: remove this style and the related <View>. Only for clarification purpose.
  products: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0
  },
  restaurants: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  pressable: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  image: {
    height: 100,
    width: 100,
    borderColor: 'grey',
    borderWidth: 1
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  cardBody: {
    flex: 5,
    padding: 4
  },
  cardText: {
    marginLeft: 10,
    fontSize: 13,
    alignSelf: 'center',
    fontFamily: 'Montserrat_600SemiBold'
  }
})
