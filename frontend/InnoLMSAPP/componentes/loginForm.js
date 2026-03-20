import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  lightRed: '#FADBD8',
};

const LoginForm = ({
  email,
  unicode,
  errors,
  loading,
  onEmailChange,
  onUnicodeChange,
  onLoginPress,
  onGuestPress,
}) => {
  const [focusedField, setFocusedField] = useState(null);
  const [emailValid, setEmailValid] = useState(false);

  const handleEmailChange = (text) => {
    onEmailChange(text);
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim()));
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Glassmorphism Premium Card */}
      <View style={styles.glassCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue learning</Text>
        </View>

        {/* Email Input Group */}
        <View style={styles.inputContainer}>
          <View style={[
            styles.inputWrapper,
            focusedField === 'email' && styles.inputWrapperFocused,
            errors.email && styles.inputWrapperError
          ]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={focusedField === 'email' ? COLORS.orange : COLORS.grey}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.grey}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
            {emailValid && !errors.email && (
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={COLORS.orange}
                style={styles.validIcon}
              />
            )}
          </View>
          {errors.email && (
            <Text style={styles.errorMessage}>{errors.email}</Text>
          )}
        </View>

        {/* Access Code Input Group */}
        <View style={styles.inputContainer}>
          <View style={[
            styles.inputWrapper,
            focusedField === 'unicode' && styles.inputWrapperFocused,
            errors.unicode && styles.inputWrapperError
          ]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={focusedField === 'unicode' ? COLORS.orange : COLORS.grey}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Access Code"
              placeholderTextColor={COLORS.grey}
              secureTextEntry
              value={unicode}
              onChangeText={onUnicodeChange}
              onFocus={() => setFocusedField('unicode')}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
          <Text style={styles.helperText}>
            Enter the code provided by your institution
          </Text>
          {errors.unicode && (
            <Text style={styles.errorMessage}>{errors.unicode}</Text>
          )}
        </View>

        {/* Primary Login Button with Gradient */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={onLoginPress}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="login"
                size={18}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.loginButtonText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider with Text */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Guest Button - Secondary Action */}
        <TouchableOpacity
          style={[styles.guestButton, loading && styles.buttonDisabled]}
          onPress={onGuestPress}
          disabled={loading}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="eye-outline"
            size={18}
            color={COLORS.orange}
            style={styles.buttonIcon}
          />
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Text */}
      <Text style={styles.footerText}>
        InnoKnowvex Learning Management System
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  cardWrapper: {
    alignItems: 'center',
    zIndex: 20,
  },

  /* Glassmorphism Card */
  glassCard: {
    width: width - 36,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    
    /* Soft Shadow - iOS style */
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    
    /* Android shadow */
    elevation: 12,
    
    /* Subtle border for glassmorphism */
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  /* Card Header */
  cardHeader: {
    marginBottom: 18,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGrey,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.grey,
    fontWeight: '400',
  },

  /* Input Container */
  inputContainer: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.ultraLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
    transition: 'all 0.3s ease',
  },
  inputWrapperFocused: {
    backgroundColor: 'rgba(255, 122, 69, 0.06)',
    borderColor: COLORS.orange,
  },
  inputWrapperError: {
    backgroundColor: 'rgba(232, 98, 111, 0.08)',
    borderColor: COLORS.softRed,
  },
  inputIcon: {
    marginRight: 10,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGrey,
    fontWeight: '500',
    paddingVertical: 0,
  },
  validIcon: {
    marginLeft: 8,
  },

  /* Helper and Error Text */
  helperText: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: '400',
    marginTop: 4,
    marginLeft: 2,
    fontStyle: 'italic',
  },
  errorMessage: {
    color: COLORS.softRed,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },

  /* Primary Login Button */
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 13,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
    
    /* Soft Glow Shadow */
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.grey,
  },

  /* Divider */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 139, 139, 0.25)',
  },
  dividerText: {
    color: COLORS.grey,
    fontSize: 12,
    marginHorizontal: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  /* Secondary Guest Button */
  guestButton: {
    width: '100%',
    height: 50,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginLeft: 6,
  },

  /* Footer */
  footerText: {
    marginTop: 14,
    color: COLORS.grey,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});

export default LoginForm;
