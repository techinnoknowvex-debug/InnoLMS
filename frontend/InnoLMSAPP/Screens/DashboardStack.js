import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screen components
import HomeScreen from './HomeScreen';
import MyCoursesScreen from './MyCoursesScreen';
import ExploreScreen from './ExploreScreen';
import CertificatesScreen from './CertificatesScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  salmon: '#FF7F50',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#f5f5f5',
  white: '#ffffff',
};

const DashboardStack = () => {
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsGuest(!token);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsGuest(true);
      }
    };
    checkLoginStatus();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'MyCourses') {
            iconName = 'book-open';
          } else if (route.name === 'Explore') {
            iconName = 'compass';
          } else if (route.name === 'Certificates') {
            iconName = 'certificate';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.salmon,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGrey,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: COLORS.salmon,
          borderBottomWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerShadowVisible: true,
      })}
    >
  
      {!isGuest && (
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Dashboard' }}
          />
          <Tab.Screen
            name="MyCourses"
            component={MyCoursesScreen}
            options={{ title: 'My Courses' }}
          />
        </>
      )}
      
   
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Explore' }}
      />
      

      {!isGuest && (
        <Tab.Screen
          name="Certificates"
          component={CertificatesScreen}
          options={{ title: 'Certificates' }}
        />
      )}
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default DashboardStack;
