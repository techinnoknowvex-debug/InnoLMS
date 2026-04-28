import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Video } from 'expo-av';

const VideoPlayerScreen = ({ route }) => {
  const { videoUrl, lessonTitle, classNumber, weekNumber, courseTitle } = route.params || {};
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  const videoSource = videoUrl ? { uri: videoUrl } : null;

  if (!videoSource) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Video not available for this lesson.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{courseTitle || 'Course Lesson'}</Text>
        <Text style={styles.lessonTitle}>{lessonTitle || `Lesson ${classNumber}`}</Text>
        <Text style={styles.metaText}>Week {weekNumber || '-'} • Class {classNumber || '-'}</Text>
      </View>

      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={videoSource}
          useNativeControls
          resizeMode="contain"
          shouldPlay={true}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          onError={(error) => {
            Alert.alert('Playback error', error?.message || 'Unable to play this video.');
          }}
        />
        {!status.isLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFA366" />
            <Text style={styles.loadingText}>Preparing video...</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsBox}>
        <Text style={styles.detailsLabel}>Lesson</Text>
        <Text style={styles.detailsText}>{lessonTitle || 'No lesson title provided.'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingText: {
    marginTop: 12,
    color: '#ffffff',
  },
  detailsBox: {
    padding: 18,
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
  },
  detailsLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 15,
    color: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default VideoPlayerScreen;
