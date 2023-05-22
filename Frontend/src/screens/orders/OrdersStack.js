import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import OrdersScreen from './OrdersScreen'
import OrderDetailScreen from './OrderDetailScreen'
import EditOrderDetailScreen from './EditOrderDetailScreen'
import ConfirmEditOrderScreen from './ConfirmEditOrderScreen'

const Stack = createNativeStackNavigator()

export default function OrdersStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='OrdersScreen'
        component={OrdersScreen}
        options={{
          title: 'My Orders'
        }} />
      <Stack.Screen
        name='OrderDetailScreen'
        component={OrderDetailScreen}
        options={{
          title: 'Order Detail'
        }} />
        <Stack.Screen
          name='EditOrderDetailScreen'
          component={EditOrderDetailScreen}
          options={{
            title: 'Edit Order'
          }} />
          <Stack.Screen
            name='ConfirmEditOrderScreen'
            component={ConfirmEditOrderScreen}
            options={{
              title: 'Confirm Edit Order'
            }}/>
    </Stack.Navigator>
  )
}
