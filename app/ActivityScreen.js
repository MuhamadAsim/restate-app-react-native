import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActivityScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch and clean logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('documentLogs');
      const parsedLogs = stored ? JSON.parse(stored) : [];

      // Keep only the most recent 10
      const recentLogs = parsedLogs.slice(0, 10);
      setLogs(recentLogs);

      // If there were more than 10, save trimmed version
      if (parsedLogs.length > 10) {
        await AsyncStorage.setItem('documentLogs', JSON.stringify(recentLogs));
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      Alert.alert('Error', 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <Text style={styles.logAction}>📄 {item.details}</Text>
      <Text style={styles.logMeta}>
        {item.date} • {item.time}
      </Text>
      <Text style={styles.logSmall}>
        Category: {item.category} | Tag: {item.tag}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recent Activity</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
      ) : logs.length === 0 ? (
        <Text style={styles.noLogs}>No activity yet</Text>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  logMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logSmall: {
    fontSize: 12,
    color: '#999',
  },
  noLogs: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 15,
  },
});

export default ActivityScreen;
