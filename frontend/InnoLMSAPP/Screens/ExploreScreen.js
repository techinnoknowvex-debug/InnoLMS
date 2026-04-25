import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnrollmentForm from '../componentes/EnrollmentForm';
import { Config } from '../config';
const BASE_URL = Config.API_BASE_URL;
const ExploreScreen = ({ navigation }) => {

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userData, setUserData] = useState(null)

  const COLORS = {
    salmon: '#FFA366',
    black: '#000000',
    grey: '#808080',
    lightGrey: '#f5f5f5',
    white: '#ffffff',
  };


  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setIsLoggedIn(true);
          setUserId(token);
          
          // Get user data from AsyncStorage
          const userDataStr = await AsyncStorage.getItem('userData');
          if (userDataStr) {
            const parsedUserData = JSON.parse(userDataStr);
            setUserData(parsedUserData);
          }
          
          await fetchEnrolledCourses(token);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    }
    checkLoginStatus();
  }, []);


  const fetchEnrolledCourses = async (studentId) => {
    try {
      const res = await fetch(`${BASE_URL}/LMS/student_enrollments/${studentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolledCourses(data.enrolled_course_ids || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  useEffect(()=>{
        async function getCourses() {
          setLoading(true)
          try{
            const API_URL = `${BASE_URL}/LMS/course` 
            const res=await fetch(API_URL,{
              method:"GET",
              headers: { "Content-Type": "application/json" }
            })
            const coursedata=await res.json()
          
            if(!res.ok){
              Alert.alert("Error", coursedata.message || "Error occurred")
            }else{
              setCourses(coursedata.courses)
            }
          } catch (err) {
            Alert.alert("Error", err.message)
          } finally {
            setLoading(false)
          }
        }
        getCourses();
  },[])

  const handleCoursePress = (course) => {

    if (isLoggedIn && enrolledCourses.includes(course.id)) {
      Alert.alert("Already Enrolled", `You are already enrolled in ${course.title}.\n\nOpening My Courses...`, [
        {
          text: "OK",
          onPress: () => navigation.navigate('MyCourses')
        }
      ])
      return
    }

    setSelectedCourse(course)
    setShowEnrollForm(true)
  }

  const handleEnrollmentSubmit = async (formData) => {
    try{
      const endpoint = `${BASE_URL}/LMS/student_enroll`;
      
      let body = {
        name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        course: formData.course_title
      };
    

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json();
      if(!res.ok){
        Alert.alert("Error", data.message)
      }else{
        setShowEnrollForm(false);
        Alert.alert("Success", data.message || "We'll contact you soon!")
      }
    }catch(err){
        Alert.alert("Error", "Internal server error: " + err.message)
    }
  }

  if(loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.lightGrey }]}>
        <ActivityIndicator size="large" color={COLORS.salmon} />
      </View>
    )
  }

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: COLORS.lightGrey }]}>
        <View style={[styles.header, { backgroundColor: COLORS.salmon }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Explore Courses</Text>
              <Text style={styles.subHeaderText}>
                {isLoggedIn ? "Expand Your Knowledge" : "Join Our Community"}
              </Text>
            </View>
            <Text style={styles.headerIcon}>{isLoggedIn ? "🎓" : "🌟"}</Text>
          </View>
          <View style={styles.headerStats}>
            <Text style={styles.statsText}>{courses.length} courses available</Text>
            {isLoggedIn && <Text style={styles.statsText}>✓ {enrolledCourses.length} enrolled</Text>}
          </View>
        </View>
        
        <View style={styles.coursesGrid}>
          {courses.map((item)=>(
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.card,
                isLoggedIn && enrolledCourses.includes(item.id) && styles.cardEnrolled,
                { width: '48%' }
              ]}
              onPress={() => handleCoursePress(item)}
            >
              <Image 
                source={require('../assets/innobg.png')}
                style={styles.courseImage}
              />
              <View style={styles.cardContent}>
                <Text style={[styles.courseTitle, { color: COLORS.black }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.courseDescription, { color: COLORS.grey }]} numberOfLines={2}>
                  {item.description || 'No description'}
                </Text>
                <View style={styles.courseInfo}>
                  <Text style={[styles.infoText, { color: COLORS.grey }]}>📚 {item.total_weeks || 'N/A'} wks</Text>
                  <Text style={[styles.infoText, { color: COLORS.grey }]}>✓ {item.pass_percentage || 'N/A'}%</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.enrollButton,
                    isLoggedIn && enrolledCourses.includes(item.id) ? { backgroundColor: COLORS.grey } : { backgroundColor: COLORS.salmon }
                  ]}
                  onPress={() => handleCoursePress(item)}
                >
                  <Text style={styles.enrollButtonText}>
                    {isLoggedIn && enrolledCourses.includes(item.id) ? "View Course" : "Enroll Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showEnrollForm}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEnrollForm(false)}
      >
        <View style={[styles.modalHeader, { backgroundColor: COLORS.salmon }]}>
          <TouchableOpacity onPress={() => setShowEnrollForm(false)}>
            <Text style={styles.closeButton}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <EnrollmentForm 
          course={selectedCourse}
          onSubmit={handleEnrollmentSubmit}
          isGuest={!isLoggedIn}
          userData={isLoggedIn ? userData : null}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subHeaderText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 4,
    fontWeight: '500',
  },
  headerIcon: {
    fontSize: 32,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between'
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5
  },
  cardEnrolled: {
    borderWidth: 2.5,
    borderColor: '#808080'
  },
  courseImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#e0e0e0'
  },
  cardContent: {
    padding: 10
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 14
  },
  courseInfo: {
    marginBottom: 8
  },
  infoText: {
    fontSize: 9,
    marginBottom: 2,
    fontWeight: '500',
  },
  enrollButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  enrollButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11
  },
  modalHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  closeButton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
})

export default ExploreScreen;
