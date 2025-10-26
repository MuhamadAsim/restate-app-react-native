import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        const storedUser = await AsyncStorage.getItem('user');

        if (hasCompletedOnboarding === 'true') {
            router.replace('/login'); // not logged in, go to login
            return;
          }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const screens = [
    {
      id: 0,
      title: 'Welcome',
      bgColor: '#667eea',
      content: 'splash'
    },
    {
      id: 1,
      title: 'Welcome to KOSH',
      subtitle: 'We are an app where you can store all your important documents digitally',
      bgColor: '#f8f9fa',
      emoji: '🎈',
      content: 'onboarding'
    },
    {
      id: 2,
      title: 'Access anywhere',
      subtitle: 'Access your documents anytime, anywhere with secure cloud storage',
      bgColor: '#f8f9fa',
      emoji: '📱',
      content: 'onboarding'
    },
    {
      id: 3,
      title: 'Safe & Secure',
      subtitle: 'Your documents are encrypted and protected with advanced security',
      bgColor: '#f8f9fa',
      emoji: '✅',
      content: 'onboarding'
    }
  ];

  const currentScreenData = screens[currentScreen];

  const handleNext = async () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // ✅ Mark onboarding as completed
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.push('/language');
    }
  };

  // 🌀 Show loader while checking onboarding/login status
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentScreenData.bgColor }]}>
      {/* Screen Content */}
      <View style={styles.content}>
        {currentScreenData.content === 'splash' ? (
          <>
            <Text style={styles.logo}>KOSH</Text>
            <TouchableOpacity style={styles.splashButton} onPress={handleNext}>
              <Text style={styles.splashButtonText}>Get started</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>{currentScreenData.emoji}</Text>
            <Text style={styles.title}>{currentScreenData.title}</Text>
            <Text style={styles.subtitle}>{currentScreenData.subtitle}</Text>
          </>
        )}
      </View>

      {/* Navigation */}
      {currentScreenData.content === 'onboarding' && (
        <View style={styles.footer}>
          {/* Dots */}
          <View style={styles.dots}>
            {screens.slice(1).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentScreen === index + 1 && styles.dotActive
                ]}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 2,
    marginBottom: 60,
  },
  splashButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    elevation: 5,
  },
  splashButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  emoji: { fontSize: 120, marginBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  footer: { padding: 30, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: { width: 24, backgroundColor: '#667eea' },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
