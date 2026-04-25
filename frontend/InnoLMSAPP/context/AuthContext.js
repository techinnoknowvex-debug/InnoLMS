import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Config } from '../config';

const AuthContext = createContext({});
const BASE_URL = Config.API_BASE_URL;
// Get unique device ID
const getDeviceId = async () => {
  return Device.modelId || Device.deviceName || 'unknown-device';
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        dispatch({ type: 'RESTORE_TOKEN', payload: token });
      } catch (e) {
        console.error('Failed to restore token', e);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    state,
    
    // Step 1: Request OTP
    requestOTP: async (phone) => {
      try {
        const response = await fetch(`${BASE_URL}/LMS/requestOTP`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to request OTP');
        }

        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Step 2: Verify OTP
    verifyOTP: async (phone, otp) => {
      try {
        const response = await fetch(`${BASE_URL}/LMS/verifyOTP`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'OTP verification failed');
        }

        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Step 3: Complete login with device registration
    signIn: async (phone, deviceName) => {
      try {
        const deviceId = await getDeviceId();
        
        const response = await fetch(`${BASE_URL}/LMS/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, device_id: deviceId, device_name: deviceName || 'Mobile Device' }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        await AsyncStorage.setItem('userToken', data.id.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await AsyncStorage.setItem('deviceId', deviceId);
        
        // Store verification status
        await AsyncStorage.setItem('emailVerified', data.email_verified ? 'true' : 'false');
        await AsyncStorage.setItem('phoneVerified', data.phone_verified ? 'true' : 'false');
        
        // Only sign in if email is already verified
        if (!data.needs_email_verification) {
          dispatch({ type: 'SIGN_IN', payload: data.id.toString() });
        }
        
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Step 4: Send email verification link
    sendEmailVerification: async (phone, studentId) => {
      try {
        const response = await fetch(`${BASE_URL}/LMS/sendEmailVerification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, studentId }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send verification email');
        }

        // If email is already verified, skip the verification modal
        if (data.skip_verification || data.email_verified) {
          return { success: true, data, skip_verification: true };
        }

        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Step 5: Verify email token and complete login
    verifyEmailToken: async (token, studentId) => {
      try {
        const response = await fetch(`${BASE_URL}/LMS/verifyEmailToken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, studentId }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Email verification failed');
        }

        // Store token and user data
        await AsyncStorage.setItem('userToken', data.id.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await AsyncStorage.setItem('emailVerified', 'true');
        
        dispatch({ type: 'SIGN_IN', payload: data.id.toString() });
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Step 5b: Check email verification status and complete login
    checkEmailVerification: async (phone, studentId) => {
      try {
        const response = await fetch(`${BASE_URL}/LMS/checkEmailVerification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, studentId }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Email not verified yet');
        }

        // Store token and user data
        await AsyncStorage.setItem('userToken', data.id.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        
        dispatch({ type: 'SIGN_IN', payload: data.id.toString() });
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Register device
    registerDevice: async (studentId, deviceName) => {
      try {
        const deviceId = await getDeviceId();
        
        const response = await fetch(`${BASE_URL}/LMS/registerDevice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId, device_id: deviceId, device_name: deviceName }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Device registration failed');
        }

        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    signInWithToken: async (studentId) => {
      try {
        // Store token to update auth state
        await AsyncStorage.setItem('userToken', studentId.toString());
        dispatch({ type: 'SIGN_IN', payload: studentId.toString() });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('deviceId');
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    signUp: async (phone, deviceName) => {
      // Implement signup if needed
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
