import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CourseVerificationModal from '../componentes/CourseVerificationModal';
import { Config } from '../config';
const BASE_URL = Config.API_BASE_URL;
const MyCoursesScreen = ({ navigation }) => {
  
    const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [verificationModal, setVerificationModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [verifiedCourses, setVerifiedCourses] = useState([]);

  const COLORS = {
    salmon: '#FFA366',
    black: '#000000',
    grey: '#808080',
    lightGrey: '#f5f5f5',
    white: '#ffffff',
    green: '#51CF66'
  };

  // Get user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserId(token);
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async (studentId) => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/LMS/student_enrollments/${studentId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const data = await res.json();
      if (res.ok && data.enrolled_course_ids) {
        setEnrolledCourses(data.enrolled_course_ids);
        setEnrollments(data.enrollments || []);
        setVerifiedCourses(
          (data.enrollments || [])
            .filter((item) => item.is_verified)
            .map((item) => item.course_id)
        );
        // Fetch details for each course
        await fetchCourseDetails(data.enrolled_course_ids);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch enrolled courses');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load enrolled courses: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch course details
  const fetchCourseDetails = async (courseIds) => {
    try {
      const details = [];
      for (const id of courseIds) {
        const res = await fetch(
          `${BASE_URL}/LMS/course/${id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const data = await res.json();
        if (res.ok && data.course) {
          details.push(data.course[0]);
        }
      }
      setCourseDetails(details);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (userId) {
      fetchEnrolledCourses(userId);
    }
  }, [userId, fetchEnrolledCourses]);

  // Load courses on mount
  useEffect(() => {
    if (userId) {
      fetchEnrolledCourses(userId);
    }
  }, [userId, fetchEnrolledCourses]);

  // Handle course click
  const handleCoursePress = (course) => {
    const enrollment = enrollments.find((item) => item.course_id === course.id);
    if (enrollment?.is_verified) {
      navigation.navigate('CourseDetails', {
        courseId: course.id,
        courseTitle: course.title,
      });
      return;
    }

    setSelectedCourse(course);
    setVerificationModal(true);
  };

  // Handle successful verification
  const handleVerificationSuccess = (enrollment) => {
    setVerifiedCourses((prev) => Array.from(new Set([...prev, selectedCourse?.id])));
    setEnrollments((prev) =>
      prev.map((item) =>
        item.course_id === selectedCourse?.id ? { ...item, is_verified: true } : item
      )
    );
    setVerificationModal(false);

    navigation.navigate('CourseDetails', {
      courseId: selectedCourse?.id,
      courseTitle: selectedCourse?.title,
    });
  };

  // Empty state
  if (loading && courseDetails.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.lightGrey }]}>
        <ActivityIndicator size="large" color={COLORS.salmon} />
        <Text style={[styles.text, { marginTop: 10, color: COLORS.grey }]}>
          Loading your courses...
        </Text>
      </View>
    );
  }

  if (courseDetails.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.lightGrey }]}>
        <View style={[styles.emptyContainer]}>
          <Text style={[styles.emptyIcon, { fontSize: 60 }]}>📚</Text>
          <Text style={[styles.emptyTitle, { color: COLORS.black }]}>
            No Enrolled Courses Yet
          </Text>
          <Text style={[styles.emptyText, { color: COLORS.grey }]}>
            Explore and enroll in courses to get started!
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: COLORS.salmon }]}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={[styles.buttonText, { color: COLORS.white }]}>
              Explore Courses
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.lightGrey }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.salmon }]}>
          <Text style={styles.headerTitle}>My Courses</Text>
          <Text style={styles.subHeaderText}>
            {courseDetails.length} Enrolled Course{courseDetails.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Courses List */}
        <View style={styles.coursesContainer}>
          {courseDetails.map((course) => {
            const isVerified = verifiedCourses.includes(course.id);
            return (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseCard,
                  { backgroundColor: COLORS.white },
                  isVerified && { borderLeftWidth: 4, borderLeftColor: COLORS.green }
                ]}
                onPress={() => handleCoursePress(course)}
              >
                <Image
                  source={require('../assets/innobg.png')}
                  style={styles.courseImage}
                />
                <View style={styles.courseContent}>
                  <Text style={[styles.courseTitle, { color: COLORS.black }]}>
                    {course.title}
                  </Text>
                  <Text
                    style={[styles.courseDescription, { color: COLORS.grey }]}
                    numberOfLines={2}
                  >
                    {course.description || 'No description available'}
                  </Text>
                  <View style={styles.courseFooter}>
                    <Text style={[styles.courseInfo, { color: COLORS.grey }]}>
                      📚 {course.total_weeks || 'N/A'} weeks
                    </Text>
                    <Text style={[styles.courseInfo, { color: COLORS.grey }]}>
                      ✓ {course.pass_percentage || 'N/A'}% Pass
                    </Text>
                  </View>
                  {!isVerified && (
                    <Text style={[styles.verifyText, { color: COLORS.salmon }]}>
                      Tap to verify and access
                    </Text>
                  )}
                  {isVerified && (
                    <Text style={[styles.verifyText, { color: COLORS.green }]}>
                      ✓ Verified
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Course Verification Modal */}
      <CourseVerificationModal
        visible={verificationModal}
        course={selectedCourse}
        onClose={() => setVerificationModal(false)}
        onVerified={handleVerificationSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  emptyIcon: {
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  exploreButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  subHeaderText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9
  },
  text: {
    fontSize: 14
  },
  coursesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16
  },
  courseCard: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  courseContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  courseDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8
  },
  courseFooter: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  courseInfo: {
    fontSize: 12
  },
  verifyText: {
    fontSize: 11,
    fontWeight: '600'
  }
});

export default MyCoursesScreen;
