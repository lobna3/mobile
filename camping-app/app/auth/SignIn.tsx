import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import JWT from 'expo-jwt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

interface User {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleLogin = async () => {

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const newData: User = { email, password };

      const res = await fetch('http://192.168.10.20:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('isAuthenticated', 'true');
      const token = data.token.replace('Bearer ', '');


      const key = 'mySuperSecretPrivateKey';


      console.log('Login successful!', data);
      router.replace('home');

    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message);
      Alert.alert('Login Error', err.message);
    }
  };
  return (
    <ImageBackground
      source={{ uri: 'https://images.ctfassets.net/jxp0iaf0waox/4vIPUXYin41sR4fswBzFJD/1a52a94a60964682d2a894f2c7823e3f/ill6.jpg?w=635&h=635&q=70' }}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              placeholderTextColor="#ddd"

              onChangeText={(text) => setEmail(text)}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"

            />

            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Password"
              placeholderTextColor="#ddd"
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>

              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.or}>OR</Text>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
              <AntDesign name="google" size={24} color="black" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Join Us With Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("auth/SignUp")}>
              <Text style={styles.registerLink}>Don't have an account? <Text style={styles.registerLinkBold}>Register</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};


export default LoginScreen;





const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'flex-start',
    marginBottom: 5,
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: 'white',
    width: '100%',
    fontSize: 16,
  },
  forgotPassword: {
    color: 'white',
    textAlign: 'right',
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#B3492D',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  or: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 18,
    textAlign: 'center',
    marginLeft: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  registerLink: {
    color: '#B3492D',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  registerLinkBold: {
    fontWeight: 'bold',
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },

});