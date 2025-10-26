import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import styles from './styles/notesStyle';

const NotesScreen = () => {
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Load note from AsyncStorage on component mount
  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    try {
      const savedNote = await AsyncStorage.getItem('userNote');
      if (savedNote !== null) {
        setNoteText(savedNote);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load your note');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Empty Note', 'Please write something before saving');
      return;
    }

    setSaving(true);
    try {
      await AsyncStorage.setItem('userNote', noteText);
      Alert.alert('Success', 'Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save your note');
    } finally {
      setSaving(false);
    }
  };

  const clearNote = () => {
    Alert.alert(
      'Clear Note',
      'Are you sure you want to clear this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setNoteText('');
            try {
              await AsyncStorage.removeItem('userNote');
              Alert.alert('Success', 'Note cleared!');
            } catch (error) {
              console.error('Error clearing note:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/DashboardScreen')}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Note</Text>
        <TouchableOpacity 
          onPress={clearNote}
          style={styles.clearButton}
        >
          <Icon name="trash-2" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      {/* Note Input Area */}
      <ScrollView style={styles.noteContainer}>
        <TextInput
          style={styles.noteInput}
          placeholder="Start writing your note..."
          placeholderTextColor="#999"
          multiline
          value={noteText}
          onChangeText={setNoteText}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Character Count */}
      <View style={styles.infoBar}>
        <Text style={styles.characterCount}>
          {noteText.length} characters
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={saveNote}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Note</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NotesScreen;