import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from './Screens/login';
import DashboardStack from './Screens/DashboardStack';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();

const COLORS = {
  salmon: '#FFA366',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#f5f5f5',
  white: '#ffffff',
};

function RootNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.salmon} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.salmon,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      {state.userToken == null ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ 
            headerShown: false,
            animationEnabled: false 
          }}
        />
      ) : (
        <Stack.Screen
          name="DashboardStack"
          component={DashboardStack}
          options={{ 
            headerShown: false,
            animationEnabled: false 
          }}
        />
      )}
      <Stack.Screen
        name="GuestDashboard"
        component={DashboardStack}
        options={{ 
          headerShown: false,
          animationEnabled: false 
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar barStyle="light-content" backgroundColor={COLORS.salmon} translucent={false} />
      </NavigationContainer>
    </AuthProvider>
  );
}
