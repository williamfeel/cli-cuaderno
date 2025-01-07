import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { CuadernoScreen } from "../screens/CuadernoScreen";
import { LibroScreen } from "../screens/LibroScreen";



export type RootStackParams = {

  HomeScreen: undefined;
  CuadernoScreen: {id: string|number, name: string};
  LibroScreen: undefined;
}

const Stack = createNativeStackNavigator<RootStackParams>()

export const MyStackNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerShown:false
        }}
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CuadernoScreen" component={CuadernoScreen} />
        <Stack.Screen name="LibroScreen" component={LibroScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}