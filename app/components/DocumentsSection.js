import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '../styles/dashboardStyle'; // assuming you have a colors file


const DocumentsSection = () => {
  const documents = [
    { id: 1, name: 'National Id', icon: '🪪' },
    { id: 2, name: 'Driving Licence', icon: '📝' },
    { id: 3, name: 'Citizenship', icon: '📜' },
    { id: 4, name: 'Passport', icon: '📘' },
    { id: 5, name: 'Voter Id', icon: '🪑' }
  ];

  return (
    <View style={styles.documentsSection}>
      <Text style={styles.sectionTitle}>Documents</Text>
      <View style={styles.documentsGrid}>
        {documents.map(doc => (
          <TouchableOpacity key={doc.id} style={styles.documentCard}>
            <Text style={styles.docIcon}>{doc.icon}</Text>
            <Text style={styles.docName}>{doc.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.documentCard, styles.moreCard]}>
          <View style={styles.moreIcon}>
            {[1,2,3,4].map(i => <View key={i} style={styles.dot} />)}
          </View>
          <Text style={[styles.docName, styles.moreCardText]}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentsSection;