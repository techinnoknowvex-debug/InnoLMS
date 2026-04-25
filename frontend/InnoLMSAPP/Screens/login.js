import React, { useState } from 'react';
import {View,Text,StyleSheet,Alert,KeyboardAvoidingView,ScrollView,Image,Dimensions,TouchableOpacity,TextInput,ActivityIndicator} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { Config } from '../config';

const { width, height } = Dimensions.get('window');
const BASE_URL = Config.API_BASE_URL;
const COLORS = {
  salmon: '#FFA366',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#f5f5f5',
  white: '#ffffff',
};

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp, email
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [studentId, setStudentId] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { requestOTP, verifyOTP, signIn, sendEmailVerification, verifyEmailToken, checkEmailVerification, signInWithToken } = useAuth();

  // Validate phone
  const validatePhone = () => {
    let newErrors = {};
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP
  const validateOtp = () => {
    let newErrors = {};
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Request OTP
  const handleRequestOTP = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    try {
      const result = await requestOTP(phone.replace(/\D/g, ''));
      if (result.success) {
        setOtpSent(true);
        setStep('otp');
        setTimer(300); 
        startTimer();
        Alert.alert('Success', 'OTP sent to your phone');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request OTP');
      console.error('OTP request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer for OTP expiry
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };



  // Verify OTP and check email verification status
  const handleVerifyOTP = async () => {
    if (!validateOtp()) return;

    setLoading(true);
    try {
      const result = await verifyOTP(phone.replace(/\D/g, ''), otp);
     
      if (result.success) {
        const studentIdFromResponse = result.data?.studentId;
    
        if (studentIdFromResponse) {
          setStudentId(studentIdFromResponse);
        }
        
        // Check email verification status
        const response = await fetch(`${BASE_URL}/LMS/student/${studentIdFromResponse}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.email_verified) {
         
          await AsyncStorage.setItem('userData', JSON.stringify(data));
          await signInWithToken(studentIdFromResponse);
          
          Alert.alert("Login Success", "Welcome back!");
        } else {
          // Email not verified - Go to email verification step
          setStep('email');
          setVerificationSent(false);
          
          await handleSendEmailVerification(studentIdFromResponse);
        }
      } else {
        Alert.alert('Verification Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSendEmailVerification = async (id = studentId) => {
    
    if (!phone || !id) {
      Alert.alert('Error', 'Phone or Student ID missing. Please verify OTP first.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmailVerification(phone.replace(/\D/g, ''), id);
      
      if (result.success) {
        setVerificationSent(true);
        Alert.alert('Success', 'Verification email sent! Check your inbox.');
      } else {
        console.log('[Email Send] FAILED - Error from API:', result.error);
        // Check if error is due to no enrollment
        if (result.error && result.error.includes('not enrolled')) {
          Alert.alert('Not Enrolled', result.error + '\n\nPlease enroll in a course first to login.');
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email: ' + error.message);
      console.error('Email verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0) {
      Alert.alert('Please wait', `Try again in ${Math.ceil(timer / 60)} minute(s)`);
      return;
    }
    setOtp('');
    await handleRequestOTP();
  };

  // Complete Login after Email Verification
  const handleCompleteLogin = async () => {
    if (!phone || !studentId) {
      Alert.alert('Error', 'Phone or Student ID missing. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const result = await checkEmailVerification(phone.replace(/\D/g, ''), studentId);
      if (result.success) {
        // Store user data and sign in
        const userData = result.data;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await signInWithToken(userData.id);
        
        Alert.alert('Success', 'Login completed successfully!');
      } else {
        Alert.alert('Verification Pending', result.error || 'Please verify your email first.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete login');
      console.error('Complete login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate('GuestDashboard', { 
      screen: 'Explore'
    });
  };

  return (
    <>
      <LinearGradient
        colors={['#FFA366', '#FFB399', '#FFDCC4']}
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
            <View style={styles.decorativeShape1} />
            <View style={styles.decorativeShape2} />
            
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

            <View style={styles.formContainer}>
              {step === 'phone' ? (
                <>
                  <Text style={styles.stepTitle}>Enter Your Phone Number</Text>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                  
                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRequestOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Request OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : step === 'otp' ? (
                <>
                  <Text style={styles.stepTitle}>Enter OTP</Text>
                  <Text style={styles.otpSentText}>OTP sent to {phone}</Text>
                  
                  <TextInput
                    style={[styles.input, errors.otp && styles.inputError]}
                    placeholder="6-digit OTP"
                    placeholderTextColor="#999"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                  {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                  
                  {timer>0&& (
                    <Text style={styles.timerText}>
                      OTP expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </Text>
                  )}

                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Verify & Login</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={timer > 0}
                  >
                    <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                      {timer > 0 ? `Resend OTP (${Math.ceil(timer / 60)}m)` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setStep('phone'); setPhone(''); setOtp(''); setTimer(0); }}>
                    <Text style={styles.changePhoneText}>Change Phone Number</Text>
                  </TouchableOpacity>
                </>
              ) : step === 'email' ? (
                <>
                  <Text style={styles.stepTitle}>Verify Your Email</Text>
                  <Text style={styles.emailDescText}>We've sent a verification link to your registered email. Click the link to complete your login.</Text>
                  
                  {!verificationSent ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendEmailVerification}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Send Verification Email</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.resendButton}
                        onPress={handleSendEmailVerification}
                      >
                        <Text style={styles.resendText}>Resend Email</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.successBox}>
                        <Text style={styles.successText}>✓ Verification email sent!</Text>
                        <Text style={styles.successSubText}>Click the link in your email to verify, then press Login below.</Text>
                      </View>

                      <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCompleteLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>✓ Login</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.resendButton}
                        onPress={handleSendEmailVerification}
                      >
                        <Text style={styles.resendText}>Resend Email</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity onPress={() => { setStep('otp'); setOtp(''); }}>
                    <Text style={styles.changePhoneText}>Back to OTP</Text>
                  </TouchableOpacity>
                </>
              ) : null
              }
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.guestButton}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
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
  
  decorativeShape1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `rgba(255, 255, 255, 0.12)`,
    top: -80,
    right: -100,
  },
  decorativeShape2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `rgba(255, 255, 255, 0.08)`,
    bottom: 50,
    left: -80,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    zIndex: 10,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 90,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    fontStyle: 'italic',
    letterSpacing: 0.4,
  },

  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },

  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },

  button: {
    backgroundColor: COLORS.salmon,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  otpSentText: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 16,
    textAlign: 'center',
  },

  timerText: {
    fontSize: 13,
    color: COLORS.salmon,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  resendButton: {
    marginTop: 12,
    paddingVertical: 8,
  },

  resendText: {
    color: COLORS.salmon,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  resendDisabled: {
    color: '#ccc',
  },

  changePhoneText: {
    color: COLORS.grey,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 16,
  },

  guestButton: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  emailDescText: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },

  successBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    padding: 16,
    marginBottom: 20,
  },

  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4,
  },

  successSubText: {
    fontSize: 13,
    color: '#558b2f',
    lineHeight: 18,
  },
});

export default LoginScreen;