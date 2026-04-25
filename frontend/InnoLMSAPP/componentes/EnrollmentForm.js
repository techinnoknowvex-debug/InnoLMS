import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Config } from '../config';

const COLORS = {
  salmon: '#FFA366',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#f5f5f5',
  white: '#ffffff',
};
const BASE_URL = Config.API_BASE_URL;

const EnrollmentForm = ({ course, onSubmit, loading = false, isGuest = false, userData = null }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const isLoggedIn = userData ? true : false;

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (userData && isLoggedIn) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
    }
  }, [userData, isLoggedIn]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill all fields');
      return;
    }

    const formData = {
      name,
      phone,
      email,
      course_id: course?.id,
      course_title: course?.title,
      is_logged_in: isLoggedIn
    };
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: COLORS.salmon }]}>
        <Text style={styles.headerTitle}>Enroll in Course</Text>
        <Text style={styles.courseName}>{course?.title}</Text>
        {isLoggedIn && <Text style={styles.userTypeText}>Logged In User</Text>}
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: COLORS.black }]}>Full Name *</Text>
        {isLoggedIn ? (
          <View style={[styles.readOnlyInput, { borderColor: COLORS.grey, backgroundColor: COLORS.lightGrey }]}>
            <Text style={[styles.readOnlyText, { color: COLORS.black }]}>{name}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, { borderColor: COLORS.grey }]}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.grey}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        )}

        <Text style={[styles.label, { color: COLORS.black }]}>Phone Number *</Text>
        <TextInput
          style={[styles.input, { borderColor: COLORS.grey }]}
          placeholder="Enter your phone number"
          placeholderTextColor={COLORS.grey}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <Text style={[styles.label, { color: COLORS.black }]}>Email Address *</Text>
        {isLoggedIn ? (
          <View style={[styles.readOnlyInput, { borderColor: COLORS.grey, backgroundColor: COLORS.lightGrey }]}>
            <Text style={[styles.readOnlyText, { color: COLORS.black }]}>{email}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, { borderColor: COLORS.grey }]}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.grey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />
        )}

        <Text style={[styles.label, { color: COLORS.black }]}>Course</Text>
        <View style={[styles.readOnlyInput, { borderColor: COLORS.grey }]}>
          <Text style={[styles.readOnlyText, { color: COLORS.black }]}>{course?.title}</Text>
        </View>

        <TouchableOpacity
          style={[styles.enrollButton, { backgroundColor: COLORS.salmon }, loading && styles.enrollButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.enrollButtonText}>Complete Enrollment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGrey
  },
  header: {
    padding: 20,
    paddingTop: 30
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8
  },
  courseName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  },
  userTypeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: 6
  },
  formContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.lightGrey
  },
  readOnlyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center'
  },
  readOnlyText: {
    fontSize: 14
  },
  enrollButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10
  },
  enrollButtonDisabled: {
    opacity: 0.6
  },
  enrollButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16
  }
});

export default EnrollmentForm;
