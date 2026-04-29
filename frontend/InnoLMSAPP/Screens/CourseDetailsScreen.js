import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Config } from '../config';
const BASE_URL = Config.API_BASE_URL;

const CourseDetailsScreen = ({ route, navigation }) => {
  const { courseId, courseTitle, courseBatch } = route.params || {};
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Schedules');

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

      try {
        setSchedulesLoading(true);
        const schedulesRes = await fetch(`${BASE_URL}/LMS/mentorSessions/${selectedCourse.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const schedulesData = await schedulesRes.json();
        if (!schedulesRes.ok) {
          throw new Error(schedulesData.message || 'Failed to load schedules');
        }
        setSchedules(schedulesData.sessions || []);
      } catch (scheduleError) {
        setSchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      setSchedulesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (lesson) => {
    if (!lesson.video_url) {
      Alert.alert('Video not available', 'This lesson does not have a video uploaded yet.');
      return;
    }

    navigation.navigate('VideoPlayer', {
      videoUrl: lesson.video_url,
      lessonTitle: lesson.title || `Lesson ${lesson.class_number}`,
      classNumber: lesson.class_number,
      weekNumber: lesson.week_number,
      courseTitle: course?.title || courseTitle,
    });
  };

  const openScheduleLink = async (link) => {
    if (!link) {
      Alert.alert('No link provided', 'This schedule does not include a joining link.');
      return;
    }

    const canOpen = await Linking.canOpenURL(link);
    if (!canOpen) {
      Alert.alert('Unable to open link', 'The schedule link is not valid.');
      return;
    }

    await Linking.openURL(link);
  };

  const parseSessionDateTime = (session) => {
    if (!session?.session_date) return null;
    const isoString = `${session.session_date}T${session.session_time || '00:00'}`;
    const parsed = new Date(isoString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const getMonthShort = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '---';
    return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };
  const getSessionStatus = (session) => {
    const dateTime = parseSessionDateTime(session);
    if (!dateTime) return 'Unknown';
    return dateTime < new Date() ? 'Ended' : 'Active';
  };

  const isSessionEnded = (session) => {
    const dateTime = parseSessionDateTime(session);
    return dateTime ? dateTime < new Date() : false;
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

      <View style={styles.tabRow}>
        {['Schedules', 'Recordings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabButtonText, selectedTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Schedules' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentor Schedules</Text>
          {schedulesLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#FFA366" />
              <Text style={[styles.emptyText, { marginTop: 10 }]}>Loading schedules...</Text>
            </View>
          ) : schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No schedules yet</Text>
              <Text style={styles.emptyText}>
                Mentor schedules for this subject will appear here once they are created.
              </Text>
            </View>
          ) : (
            schedules.map((session) => (
              <View key={session.id} style={styles.scheduleCard}>
                <View style={styles.scheduleContent}>
                  <View style={styles.scheduleHeaderRow}>
                    <Text style={styles.scheduleTitle}>{session.title || 'Untitled schedule'}</Text>
                    <View style={[styles.statusPill, isSessionEnded(session) ? styles.statusEnded : styles.statusActive]}>
                      <Text style={styles.statusText}>{getSessionStatus(session)}</Text>
                    </View>
                  </View>
                  <View style={styles.scheduleMetaRow}>
                    <View style={styles.calendarBox}>
                      <MaterialCommunityIcons name="calendar" size={14} color="#111827" />
                      <Text style={styles.calendarMonth}>{session.session_date ? getMonthShort(session.session_date) : '--'}</Text>
                      <Text style={styles.calendarDate}>{session.session_date ? new Date(session.session_date).getDate() : '?'}</Text>
                    </View>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={12} color="#FFA366" />
                    <Text style={styles.scheduleTimeText}>{session.session_time || 'Time not set'}</Text>
                    <Text style={styles.scheduleMetaSmall}>Duration: {session.duration || 'N/A'} Mins</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.scheduleLinkButton} onPress={() => openScheduleLink(session.teachmint_link)}>
                  <MaterialCommunityIcons name="link" size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordings</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recordings available</Text>
              <Text style={styles.emptyText}>
                Recorded lessons will appear here once uploaded by the mentor.
              </Text>
            </View>
          ) : (
            Object.keys(grouped).map((week) => (
              <View key={week} style={styles.weekContainer}>
                <Text style={styles.weekTitle}>{week}</Text>
                {grouped[week].map((lesson) => (
                  <TouchableOpacity
                    key={`${lesson.week_number}-${lesson.class_number}-${lesson.id || lesson.title}`}
                    style={[styles.lessonCard, !lesson.video_url && styles.lessonCardDisabled]}
                    onPress={() => handleWatch(lesson)}
                    disabled={!lesson.video_url}
                  >
                    <View style={styles.lessonInfo}>
                      <View style={styles.lessonTitleRow}>
                        <MaterialCommunityIcons name="video-outline" size={16} color="#FFA366" />
                        <Text style={styles.lessonTitle}>{lesson.title || `Lesson ${lesson.class_number}`}</Text>
                      </View>
                      <Text style={styles.lessonSubtitle}>Class {lesson.class_number || '-'} • {lesson.duration || 'Duration not set'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>
      )}
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
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonActive: {
    backgroundColor: '#FFA366',
    shadowOpacity: 0.12,
  },
  tabButtonText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleAccent: {
    width: 4,
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFA366',
    marginRight: 14,
    marginTop: 8,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  scheduleCourse: {
    fontSize: 13,
    color: '#FFA366',
    fontWeight: '700',
    marginBottom: 8,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusEnded: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333333',
  },
  scheduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  calendarBox: {
    width: 40,
    minHeight: 44,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#FFA366',
  },
  calendarMonth: {
    fontSize: 8,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  calendarDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  scheduleTimeText: {
    fontSize: 12,
    color: '#FFA366',
    fontWeight: '700',
  },
  scheduleMetaSmall: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFA366',
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleLinkButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scheduleDescription: {
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 20,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardDisabled: {
    opacity: 0.6,
  },
  lessonInfo: {
    flex: 1,
    paddingRight: 12,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
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
