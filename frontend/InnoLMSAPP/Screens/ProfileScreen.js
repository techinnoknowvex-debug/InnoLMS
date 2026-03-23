import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker';
import ProfileForm from '../componentes/ProfileForm';

const ProfileScreen = ({ navigation }) => {
  const [id, setId] = useState(null);
  const [data, setData] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    async function getId() {
      const storedId = await AsyncStorage.getItem("id");
      setId(storedId);
    }
    getId();
  }, []);

  useEffect(() => {
    if (!id) return;
    async function fetchdata() {
      try {
        const res = await fetch(`http://192.168.9.121:5000/LMS/student/${id}`, {
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
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("id");
          navigation.navigate("Login");
        }
      }
    ]);
  };


  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
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
                style={styles.cameraButton}
                onPress={handleCameraPress}
              >
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>
            <Text style={styles.name}>{data.name || ""}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{data.email || "N/A"}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{data.phone || "N/A"}</Text>
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
            <Text style={styles.menuLabel}>Profile Information</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>Help</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>Refer & Earn</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutMenuItem]}
            onPress={handleLogout}
          >
            <Text style={styles.menuLabelLogout}>Log Out</Text>
            <Text style={styles.menuArrow}>›</Text>
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    color: '#1a1a1a',
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
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
    fontWeight: '500',
  },
  imageSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 16,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuLabelLogout: {
    flex: 1,
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 16,
    color: '#999',
  },
  logoutMenuItem: {
    marginBottom: 20,
  },
});

export default ProfileScreen   