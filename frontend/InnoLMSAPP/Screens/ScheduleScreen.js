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

const ScheduleScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesMap, setCoursesMap] = useState({});

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, coursesRes] = await Promise.all([
        fetch(`${BASE_URL}/LMS/mentorSessions`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${BASE_URL}/LMS/course`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      const sessionsData = await sessionsRes.json();
      const coursesData = await coursesRes.json();

      if (!sessionsRes.ok) {
        throw new Error(sessionsData.message || 'Failed to load schedules');
      }

      if (!coursesRes.ok) {
        throw new Error(coursesData.message || 'Failed to load related courses');
      }

      const courseMap = (coursesData.courses || []).reduce((map, course) => {
        map[course.id] = course.title;
        return map;
      }, {});

      setCoursesMap(courseMap);
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      Alert.alert('Error', error.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const openSessionLink = async (url) => {
    if (!url) {
      Alert.alert('No link available', 'This session does not have a link.');
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Invalid link', 'Cannot open this session link.');
      return;
    }

    await Linking.openURL(url);
  };

  const parseSessionDateTime = (session) => {
    if (!session?.session_date) return null;
    const date = new Date(`${session.session_date}T${session.session_time || '00:00'}`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getMonthShort = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '---';
    return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const isSessionEnded = (session) => {
    const dateTime = parseSessionDateTime(session);
    return dateTime ? dateTime < new Date() : false;
  };

  const getSessionStatus = (session) => {
    if (isSessionEnded(session)) return 'Ended';
    return session.session_date ? 'Active' : 'Unknown';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Mentor Schedules</Text>
        <Text style={styles.subtitle}>Recent mentor sessions and online classes from the admin portal.</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{sessions.length} Sessions</Text>
        <Text style={styles.summaryText}>Browse recent mentor schedules with course details and join links.</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFA366" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No schedules found</Text>
          <Text style={styles.emptyText}>Mentor sessions will appear here once they are created in the admin portal.</Text>
        </View>
      ) : (
        sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionDetails}>
              <View style={styles.sessionHeaderRow}>
                <Text style={styles.sessionTitle}>{session.title || 'Untitled session'}</Text>
                <View style={[styles.statusPill, isSessionEnded(session) ? styles.statusEnded : styles.statusActive]}>
                  <Text style={styles.statusText}>{getSessionStatus(session)}</Text>
                </View>
              </View>
              <View style={styles.sessionMetaRow}>
                <View style={styles.calendarBox}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#111827" />
                  <Text style={styles.calendarMonth}>{session.session_date ? getMonthShort(session.session_date) : '--'}</Text>
                  <Text style={styles.calendarDate}>{session.session_date ? new Date(session.session_date).getDate() : '?'}</Text>
                </View>
                <MaterialCommunityIcons name="clock-time-four-outline" size={12} color="#FFA366" />
                <Text style={styles.sessionTimeText}>{session.session_time || 'Time not set'}</Text>
                <Text style={styles.sessionMetaSmall}>Duration: {session.duration || 'N/A'} Mins</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinButtonSmall} onPress={() => openSessionLink(session.teachmint_link)}>
              <MaterialCommunityIcons name="link" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    color: '#4B5563',
    lineHeight: 22,
  },
  centerContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: '#6B7280',
  },
  emptyState: {
    marginTop: 32,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarBox: {
    width: 40,
    minHeight: 44,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFA366',
    paddingVertical: 6,
  },
  calendarMonth: {
    fontSize: 8,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  calendarDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  sessionTimeText: {
    fontSize: 12,
    color: '#FFA366',
    fontWeight: '700',
  },
  sessionMetaSmall: {
    fontSize: 12,
    color: '#6B7280',
  },
  sessionTag: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginBottom: 10,
  },
  sessionTagText: {
    color: '#C46B00',
    fontWeight: '700',
    fontSize: 12,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusEnded: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333333',
  },
  metaRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 6,
  },
  sessionMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 2,
  },
  sessionDescription: {
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 20,
  },
  joinButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFA366',
    borderRadius: 10,
    marginLeft: 14,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  summaryText: {
    color: '#6B7280',
    lineHeight: 20,
  },
  joinButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFA366',
    borderRadius: 10,
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default ScheduleScreen;
