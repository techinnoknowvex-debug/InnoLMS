import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet
} from 'react-native';
import { Config } from '../config';
const BASE_URL = Config.API_BASE_URL;

const CourseDetailsScreen = ({ route, navigation }) => {
  const { courseId, courseTitle, courseBatch } = route.params || {};
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    navigation.setOptions({ title: courseTitle || 'Course Details' });
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const courseRes = await fetch(`${BASE_URL}/LMS/course/${courseId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const courseData = await courseRes.json();
      if (!courseRes.ok) {
        throw new Error(courseData.message || 'Failed to load course detailS');
      }

      const selectedCourse = courseData.course?.[0] || null;
      setCourse(selectedCourse);

      if (!selectedCourse) {
        throw new Error('Course not found');
      }

      const classesRes = await fetch(`${BASE_URL}/LMS/classes/${selectedCourse.id}?course_batch=${encodeURIComponent(courseBatch)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const classesData = await classesRes.json();
      if (!classesRes.ok) {
        throw new Error(classesData.message || 'Failed to load course lessons');
      }

      setClasses(classesData.classes || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = async (lesson) => {
    if (!lesson.video_url) {
      Alert.alert('Video not available', 'This lesson does not have a video uploaded yet.');
      return;
    }

    const supported = await Linking.canOpenURL(lesson.video_url);
    if (supported) {
      await Linking.openURL(lesson.video_url);
    } else {
      Alert.alert('Unable to open video', 'The video URL is not supported on this device.');
    }
  };

  const grouped = classes.reduce((acc, lesson) => {
    const week = lesson.week_number ? `Week ${lesson.week_number}` : 'Week 1';
    if (!acc[week]) acc[week] = [];
    acc[week].push(lesson);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFA366" />
        <Text style={styles.loadingText}>Loading course details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course?.title || courseTitle || 'Course Details'}</Text>
        <Text style={styles.subtitle}>{course?.description || 'No description available.'}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Course ID: {course?.course_id || 'N/A'}</Text>
          <Text style={styles.metaText}>Weeks: {course?.total_weeks || '0'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course lessons</Text>
        {classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No lessons published yet</Text>
            <Text style={styles.emptyText}>
              Video lessons will appear here once the instructor uploads them.
            </Text>
          </View>
        ) : (
          Object.keys(grouped).map((week) => (
            <View key={week} style={styles.weekContainer}>
              <Text style={styles.weekTitle}>{week}</Text>
              {grouped[week].map((lesson) => (
                <View key={`${lesson.week_number}-${lesson.class_number}-${lesson.id || lesson.title}`} style={styles.lessonCard}>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title || `Lesson ${lesson.class_number}`}</Text>
                    <Text style={styles.lessonSubtitle}>Class {lesson.class_number || '-'} • {lesson.duration || 'Duration not set'}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.watchButton, !lesson.video_url && styles.watchButtonDisabled]}
                    onPress={() => handleWatch(lesson)}
                    disabled={!lesson.video_url}
                  >
                    <Text style={styles.watchButtonText}>{lesson.video_url ? 'Watch' : 'No video yet'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  header: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#6B7280',
    fontSize: 13,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  emptyState: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  weekContainer: {
    marginBottom: 18,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonInfo: {
    flex: 1,
    paddingRight: 12,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  watchButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFA366',
    borderRadius: 10,
  },
  watchButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  watchButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default CourseDetailsScreen;
