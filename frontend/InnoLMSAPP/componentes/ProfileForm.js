import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';

const ProfileForm = ({ visible, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    dob: '',
    city: '',
    profession: 'student'
  });

  const handleUpdateProfile = () => {
    Alert.alert("Success", "Profile updated");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Name Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            {/* Email Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
              />
            </View>

            {/* Date of Birth Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date of Birth</Text>
              <TextInput
                style={styles.formInput}
                placeholder="DD/MM/YYYY"
                value={formData.dob}
                onChangeText={(text) => setFormData({...formData, dob: text})}
              />
            </View>

            {/* City Name Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>City Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your city"
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
              />
            </View>

            {/* Profession Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Profession</Text>
              <View style={styles.professionContainer}>
                <TouchableOpacity
                  style={[
                    styles.professionButton,
                    formData.profession === 'student' && styles.professionButtonActive
                  ]}
                  onPress={() => setFormData({...formData, profession: 'student'})}
                >
                  <Text style={[
                    styles.professionButtonText,
                    formData.profession === 'student' && styles.professionButtonTextActive
                  ]}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.professionButton,
                    formData.profession === 'working' && styles.professionButtonActive
                  ]}
                  onPress={() => setFormData({...formData, profession: 'working'})}
                >
                  <Text style={[
                    styles.professionButtonText,
                    formData.profession === 'working' && styles.professionButtonTextActive
                  ]}>
                    Working
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Update Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  professionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  professionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  professionButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e8f4f8',
  },
  professionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  professionButtonTextActive: {
    color: '#007bff',
  },
  modalFooter: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileForm;
