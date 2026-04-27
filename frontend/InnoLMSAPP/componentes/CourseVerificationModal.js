import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';
const BASE_URL = Config.API_BASE_URL;
const CourseVerificationModal = ({ 
  visible, 
  course, 
  onClose, 
  onVerified 
}) => {
  
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  React.useEffect(() => {
    if (course && course.course_id) {
      setCourseId(String(course.course_id));
    } else {
      setCourseId('');
    }
  }, [course]);

  const COLORS = {
    salmon: '#FFA366',
    black: '#000000',
    grey: '#808080',
    lightGrey: '#f5f5f5',
    white: '#ffffff',
    red: '#FF6B6B',
    green: '#51CF66'
  };

  // Get or create device ID
  const getDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem('deviceId');
      if (!id) {
        id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', id);
      }
      return id;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}`;
    }
  };

  const handleVerifyCourse = async () => {
    if (!courseId.trim()) {
      Alert.alert('Error', 'Please enter the course ID');
      return;
    }

    setLoading(true);
    try {
      const studentId = await AsyncStorage.getItem('userToken');
      const deviceId = await getDeviceId();

      const response = await fetch(
        `${BASE_URL}/LMS/verifyCourse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            course_id: parseInt(courseId),
            device_id: deviceId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Verification Failed',
          data.message || 'Invalid course ID or enrollment not found'
        );
        return;
      }

      if (data.verified && data.can_stream) {
        Alert.alert(
          'Success',
          'Course verified successfully! You can now access the course.',
          [
            {
              text: 'OK',
              onPress: () => {
                setCourseId('');
                onVerified(data.enrollment);
              }
            }
          ]
        );
      } else if (data.verified && !data.can_stream) {
        Alert.alert(
          'Device Conflict',
          'This course is being accessed from another device. Please close the course on that device first.'
        );
      } else {
        Alert.alert('Error', 'Course verification failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCourseId('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: COLORS.white }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: COLORS.salmon }]}>
            <Text style={styles.modalTitle}>Verify Course Access</Text>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <Text style={[styles.infoText, { color: COLORS.black }]}>
              Course: <Text style={{ fontWeight: 'bold' }}>{course?.title}</Text>
            </Text>

            <Text style={[styles.instructionText, { color: COLORS.grey }]}>
              Enter your course ID to verify access on first login
            </Text>

            {/* Input Field */}
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: COLORS.salmon,
                  color: COLORS.black
                }
              ]}
              placeholder="Enter Course ID"
              placeholderTextColor={COLORS.grey}
              keyboardType="numeric"
              value={courseId}
              onChangeText={setCourseId}
              editable={!loading}
            />

            {/* Hint */}
            <Text style={[styles.hintText, { color: COLORS.grey }]}>
              💡 Course ID can be found in your enrollment confirmation or course details
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: COLORS.lightGrey }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: COLORS.black }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: COLORS.salmon },
                loading && { opacity: 0.6 }
              ]}
              onPress={handleVerifyCourse}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={[styles.buttonText, { color: COLORS.white }]}>
                  Verify
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContainer: {
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  },
  modalContent: {
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20
  },
  instructionText: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9'
  },
  hintText: {
    fontSize: 12,
    marginBottom: 0,
    lineHeight: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default CourseVerificationModal;
