import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JWT from 'expo-jwt';
import axios from 'axios';
import { useSocket } from '../useWebSocket';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  imagesProfile?: string[]; // Optional, used for campmates
  gender?: string;
  address?: string;
}

interface JoinCampingPost {
  userId: string;
  postId: number;
  rating: number;
  reviews: string;
  favorite: string;
  notification: string;
  status: string,
  user: User;
}

interface CampingEventData {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  equipment: string[];
  places: number;
  ageCategory: string;
  images: string[];
  organizerId: number;
  user: User;
  joinCampingPosts: JoinCampingPost[];
  category: string
}

interface ApiResponse {
  status: number;
  data: CampingEventData;
}

const PostDetailScreen: React.FC = () => {
  const { socket } = useSocket(); // Access the socket instance from context
  const [user, setUser] = useState<User>({ id: "", name: "", email: "", role: "" });
  const [post, setPost] = useState<CampingEventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false); // Track if user has joined
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Confirmation Modal
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false); // Success Modal
  const [isCancelModalVisible, setIsCancelModalVisible] = useState<boolean>(false); // Cancellation Confirmation Modal
  const [isCancelSuccessModalVisible, setIsCancelSuccessModalVisible] = useState<boolean>(false); // Cancellation Success Modal
  const [actionType, setActionType] = useState<'join' | 'cancel'>('join'); // Track action type
  const [notificationMessage, setNotificationMessage] = useState<string[]>([]);
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(false);



  const { postId } = useLocalSearchParams();
  const postIdString = typeof postId === 'string' ? postId : Array.isArray(postId) ? postId[0] : '';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const joinPost = async (body: JoinCampingPost) => {
    try {


      const response = await axios.post('http://192.168.10.20:5000/api/joinPosts/add', body);
      console.log('Success', response.data.data);
      setIsSuccessModalVisible(true); // Show success modal
      setRefresh(prev => !prev); // Trigger data refresh
    } catch (error) {
      Alert.alert('Error', 'Failed to join the post');
      console.log(error);
    }
  };

  const cancelPost = async (body: JoinCampingPost) => {
    try {

      const response = await axios.post('http://192.168.10.20:5000/api/joinPosts/cancel', body);
      console.log('Success', response.data);
      setIsCancelSuccessModalVisible(true); // Show cancellation success modal
      setRefresh(prev => !prev); // Trigger data refresh
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel the post');
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchPostDetails = async (id: string) => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>(`http://192.168.10.20:5000/api/camps/${id}`);

        setPost(response.data.data);
        console.log(response.data.data);
        if (user.id) {
          const joined = response.data.data.joinCampingPosts.some(post => post.userId === user.id && post);
          setHasJoined(joined);
        }
      } catch (error) {
        setError('Failed to fetch post details');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails(postIdString);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, postIdString, refresh, user.id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await AsyncStorage.getItem('token');
        if (data) {
          const token = data.startsWith('Bearer ') ? data.replace('Bearer ', '') : data;
          const key = 'mySuperSecretPrivateKey';

          try {
            const decodedToken = JWT.decode(token, key);
            if (decodedToken) {
              setUser({
                id: decodedToken.id || '',
                name: decodedToken.name || '',
                email: decodedToken.email || '',
                imagesProfile: decodedToken.imagesProfile,
                role: decodedToken.role || '',
              });
            } else {
              console.error('Failed to decode token');
            }
          } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
          }
        } else {
          console.error('Token not found in AsyncStorage');
        }
      } catch (storageError) {
        console.error('Failed to fetch token from AsyncStorage:', storageError);
      }
    };

    fetchUser();
  }, [refresh]);
  console.log('user', user)

  useEffect(() => {
    if (socket && user) {
      const userId = user.id;
      socket.emit('register', userId);
      socket.emit('joinRoom', userId);
  
      const handleNotification = (message: string) => {
        console.log('Received notification:', message);
        setNotificationMessage(prevMessages => [...prevMessages, message]);
        setIsNotificationVisible(true);
      };
  
      socket.on('notification', handleNotification);
  
      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, user]);
  
  
  console.log('notifications', notificationMessage)
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post not found!</Text>
      </View>
    );
  }

  const handleJoinPress = () => {
    if (!user.id) {
      Alert.alert('Error', 'You need to be logged in to join the post');
      return;
    }

    setActionType('join');
    setIsModalVisible(true);
  };

  const handleCancelPress = () => {
    if (!user.id) {
      Alert.alert('Error', 'You need to be logged in to cancel the post');
      return;
    }

    setActionType('cancel');
    setIsCancelModalVisible(true);
  };

  const confirmAction = async () => {
    setIsModalVisible(false);
    if (actionType === 'join') {
      const joinPostData: JoinCampingPost = {
        userId: user.id,
        postId: post.id,
        rating: 5,
        reviews: 'Great camping experience!',
        favorite: 'Yes',
        status: 'PENDING',
        notification: 'Great camping experience!',
        user: user,
      };
      await joinPost(joinPostData);

      // Emit event to notify the server
      if (socket) {
        socket.emit('camperJoined', post.id, user.id);
      }
    } else if (actionType === 'cancel') {
      const cancelPostData: JoinCampingPost = {
        userId: user.id,
        postId: post.id,
        rating: 5,
        reviews: 'Great camping experience!',
        favorite: 'Yes',
        notification: 'Great camping experience!',
        status: "PENDING",
        user: user,
      };
      await cancelPost(cancelPostData);
    }
  };


  const cancelAction = () => {
    setIsModalVisible(false);
  };

  const confirmCancelAction = async () => {
    setIsCancelModalVisible(false);
    const cancelPostData: JoinCampingPost = {
      userId: user.id,
      postId: post.id,
      rating: 5,
      reviews: 'Great camping experience!',
      favorite: 'Yes',
      notification: 'Great camping experience!',
      status: 'PENDING',
      user: user,
    };
    await cancelPost(cancelPostData);
  };

  const cancelCancelAction = () => {
    setIsCancelModalVisible(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  const closeCancelSuccessModal = () => {
    setIsCancelSuccessModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.imageCardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.images[0] }} style={styles.postImage} />
          <View style={styles.overlay}>
            <View style={styles.infoRow}>
              <View style={[styles.infoCard, { backgroundColor: 'rgba(179, 73, 45, 0.7)' }]}>
                <FontAwesome name="map-marker" size={30} color="#fff" />
                <Text style={styles.infoText}>{post.location}</Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: 'rgba(0, 89, 94, 0.7)' }]}>
                <FontAwesome name="users" size={30} color="#fff" />
                <Text style={styles.infoText}>{post.ageCategory}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoCard, { backgroundColor: 'rgba(179, 73, 45, 0.7)' }]}>
                <FontAwesome name="calendar" size={30} color="#fff" />
                <Text style={styles.infoText}>{post.startDate}</Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: 'rgba(0, 89, 94, 0.7)' }]}>
                <FontAwesome name="user-plus" size={30} color="#fff" />
                <Text style={styles.infoText}>{post.joinCampingPosts.length}/{post.places}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDescription}>{post.description}</Text>
          <View style={styles.equipmentSection}>
            <Text style={styles.equipmentSubtitle}>Equipment:</Text>
            {post.equipment.map((item, index) => (
              <Text key={index} style={styles.equipmentItem}>- {item}</Text>
            ))}
          </View>

          {post.user && (
            <View style={styles.hostInfo}>
              <Image source={{ uri: post.user.imagesProfile?.[0] || 'https://via.placeholder.com/50' }} style={styles.hostProfileImage} />
              <Text style={styles.hostName}>{post.user.name}</Text>
            </View>
          )}
          <View style={styles.campMatesSection}>
            <Text style={styles.campMatesTitle}>Campmates:</Text>
            <View style={styles.campMatesList}>
              {post.joinCampingPosts.filter(mate => mate.status === 'ACCEPTED').map((mate, index) => (
                <View key={index} style={styles.campMate}>
                  <Image source={{ uri: mate.user.imagesProfile?.[0] || 'https://via.placeholder.com/40' }} style={styles.campMateImage} />
                  <Text style={styles.campMateName}>{mate.user.name}</Text>
                </View>
              ))}
            </View>
          </View>
          {!hasJoined ? (
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinPress}>
              <Text style={styles.joinButtonText}>Join Us</Text>
            </TouchableOpacity>
          ) : post.joinCampingPosts.some(joinPost => joinPost.userId === user.id && joinPost.status === "PENDING") ? (
            <TouchableOpacity style={styles.joinButton} disabled>
              <Text style={styles.joinButtonText}>PENDING</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={handleCancelPress}>
              <Text style={styles.joinButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
       
      </Animated.View>

      {/* Confirmation Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Action</Text>
            <Text style={styles.modalMessage}>Are you sure you want to {actionType === 'join' ? 'join' : 'cancel'} this post?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={confirmAction}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={cancelAction}>
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <Modal
        transparent={true}
        visible={isCancelModalVisible}
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Cancellation</Text>
            <Text style={styles.modalMessage}>Are you sure you want to cancel your participation?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={confirmCancelAction}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={cancelCancelAction}>
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={isSuccessModalVisible}
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>You have successfully joined the post!</Text>
            <Pressable style={styles.modalButton} onPress={closeSuccessModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Cancellation Success Modal */}
      <Modal
        transparent={true}
        visible={isCancelSuccessModalVisible}
        onRequestClose={closeCancelSuccessModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>You have successfully canceled your participation!</Text>
            <Pressable style={styles.modalButton} onPress={closeCancelSuccessModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {isNotificationVisible && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>{notificationMessage}</Text>
          </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00595E',
  },
  imageCardContainer: {
    height: 380,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoCard: {
    width: width * 0.5 - 80,
    height: width * 0.5 - 80,
    padding: 10,
    borderRadius: 15,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 10,
  },
  detailsContainer: {
    width: width - 30,
    marginHorizontal: 15,
    marginTop: -100,
  },
  postInfo: {
    backgroundColor: '#004d49',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  postDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  equipmentSection: {
    marginBottom: 10,
  },
  equipmentSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  equipmentItem: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 3,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  hostProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderColor: '#ddd',
    borderWidth: 1,

  },
  hostName: {
    fontSize: 18,
    color: '#fff',
  },
  campMatesSection: {
    marginTop: 20,
  },
  campMatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  campMatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  campMate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 15,
  },
  campMateImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderColor: '#ddd',
  },
  campMateName: {
    color: '#fff',
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: '#B3492D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PostDetailScreen;




