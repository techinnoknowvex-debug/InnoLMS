import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../componentes/ProfileForm';
import { Config } from '../config';

const COLORS = {
  salmon: '#FFA366',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#f5f5f5',
  white: '#ffffff',
};
const BASE_URL = Config.API_BASE_URL;

const ProfileScreen = ({ navigation }) => {
  const [id, setId] = useState(null);
  const [data, setData] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const { signOut } = useAuth();

  useEffect(() => {
    async function getId() {
      const storedId = await AsyncStorage.getItem("userToken");
      setId(storedId);
    }
    getId();
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    async function fetchdata() {
      try {
        const res = await fetch(`${BASE_URL}/LMS/student/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const student = await res.json();
        if (!res.ok) {
          Alert.alert(student.message || "Error");
        } else {
          setData(student);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch profile");
      } 
    }
    fetchdata();
  }, [id]);

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Alert.alert('Success', 'Profile image updated');
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await signOut();
        },
        style: "destructive"
      }
    ]);
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: COLORS.lightGrey }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.salmon }]}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.imageSection}>
              <View style={styles.profileImageWrapper}>
                <Image
                  source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                  style={styles.profileImage}
                />
                <TouchableOpacity 
                  style={[styles.cameraButton, { backgroundColor: COLORS.salmon }]}
                  onPress={handleCameraPress}
                >
                  <Text style={styles.cameraIcon}>📷</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.name, { color: COLORS.black }]}>{data.name || "User"}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: COLORS.grey }]}>EMAIL</Text>
                <Text style={[styles.detailValue, { color: COLORS.black }]}>{data.email || "N/A"}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: COLORS.grey }]}>PHONE</Text>
                <Text style={[styles.detailValue, { color: COLORS.black }]}>{data.phone || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowProfileModal(true)}
          >
            <Text style={[styles.menuLabel, { color: COLORS.black }]}>Edit Profile</Text>
            <Text style={[styles.menuArrow, { color: COLORS.grey }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: COLORS.black }]}>My Courses</Text>
            <Text style={[styles.menuArrow, { color: COLORS.grey }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: COLORS.black }]}>Settings</Text>
            <Text style={[styles.menuArrow, { color: COLORS.grey }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutMenuItem]}
            onPress={handleLogout}
          >
            <Text style={styles.menuLabelLogout}>Log Out</Text>
            <Text style={[styles.menuArrow, { color: '#e74c3c' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Form Modal */}
      <ProfileForm 
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialData={data}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 20,
    marginHorizontal: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  detailsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailsContainer: {
    gap: 12,
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: '500',
  },
  imageSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.salmon,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  cameraIcon: {
    fontSize: 18,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuLabelLogout: {
    flex: 1,
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 18,
  },
  logoutMenuItem: {
    marginBottom: 0,
  },
});

export default ProfileScreen;