import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BarcodeScannerScreen from './BarcodeScannerScreen';
import DetailsScreen from './DetailsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableWithoutFeedback } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: {
            shadowOpacity: 0, // Removes shadow on iOS
            elevation: 0, // Removes shadow on Android
            borderBottomWidth: 0, // Removes bottom border
            backgroundColor: "#f9f9f9"
          },
          headerLeft: () => (
            navigation.canGoBack() && (
              <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="black"
                  style={{ marginLeft: 15 }}
                />
              </TouchableWithoutFeedback>
            )
          ),
          headerBackTitleVisible: false, // Hides the "Back" text
        })}
      >
        {/* Hide the header for the BarcodeScannerScreen */}
        <Stack.Screen
          name="Scanner"
          component={BarcodeScannerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Product Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
