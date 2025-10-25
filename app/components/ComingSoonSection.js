// components/ComingSoonSection.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ComingSoonSection = () => {
  const comingSoonItems = [
    { id: 1, name: 'Personal locker', icon: '🔐' },
    { id: 2, name: 'Hotels', icon: '🏨' },
    { id: 3, name: 'Airlines', icon: '✈️' },
    { id: 4, name: 'Hostels', icon: '🏠' },
    { id: 5, name: 'Movies', icon: '🎬' },
    { id: 6, name: 'Events', icon: '👔' },
    { id: 7, name: 'Bazaar', icon: '🛍️' },
    { id: 8, name: 'Social Work', icon: '📦' },
  ];

  return (
    <View style={styles.comingSoonSection}>
      <Text style={styles.sectionTitle}>Coming Soon</Text>
      
      <View style={styles.comingSoonGrid}>
        {comingSoonItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.comingSoonCard}>
            <Text style={styles.comingSoonIcon}>{item.icon}</Text>
            <Text style={styles.comingSoonName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  comingSoonSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // This ensures even spacing
  },
  comingSoonCard: {
    width: '23%', // Smaller boxes - 4 items will fit with space-between
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 90,
    justifyContent: 'center',
    marginBottom: 12, // Space between rows
  },
  comingSoonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  comingSoonName: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
  },
});

export default ComingSoonSection;