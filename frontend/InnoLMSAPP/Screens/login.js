import React, { useState } from 'react';
import {View,Text,StyleSheet,Alert,KeyboardAvoidingView,ScrollView,Image,Dimensions} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LoginForm from '../componentes/loginForm';

const { width, height } = Dimensions.get('window');

// Premium Brand Colors
const COLORS = {
  orange: '#FF7A45',
  darkOrange: '#E8642D',
  black: '#000000',
  darkGrey: '#4A4A4A',
  grey: '#8B8B8B',
  lightGrey: '#F5F5F5',
  ultraLight: '#FAFAFA',
  white: '#FFFFFF',
  softRed: '#E8626F',
  subtle: 'rgba(0, 0, 0, 0.05)',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [unicode, setUnicode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!unicode.trim()) {
      newErrors.unicode = 'Unicode is required';
    } else if (unicode.length < 6) {
      newErrors.unicode = 'Unicode must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://192.168.9.121:5000/LMS/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email:email.trim(),
          unicode:unicode,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      } else {
        Alert.alert('Success', 'Login successful!',
          [
      {
        text: 'OK',
        onPress: () => navigation.navigate('DashboardStack'),
      },
    ]
        );
          
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate('DashboardStack', { 
      screen: 'Explore',
      isGuest: true 
    });
  };

  return (
    <LinearGradient
      colors={['#F5E6D3', '#FFFFFF', '#FAFAFA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.backgroundGradient}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {/* Decorative Abstract Shapes */}
          <View style={styles.decorativeShape1} />
          <View style={styles.decorativeShape2} />
          
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>Transforming Aspirations into Achievements</Text>
          </View>

          {/* Premium Glassmorphism Login Card */}
          <LoginForm
            email={email}
            unicode={unicode}
            errors={errors}
            loading={loading}
            onEmailChange={setEmail}
            onUnicodeChange={setUnicode}
            onLoginPress={handleLogin}
            onGuestPress={handleGuestLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 40,
    position: 'relative',
  },
  
  /* Decorative Abstract Shapes */
  decorativeShape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `rgba(255, 122, 69, 0.08)`,
    top: -40,
    right: -60,
  },
  decorativeShape2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `rgba(255, 122, 69, 0.06)`,
    bottom: 100,
    left: -50,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
    zIndex: 10,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 85,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.grey,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
  