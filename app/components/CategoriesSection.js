// components/CategoriesSection.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/dashboardStyle';

const CategoriesSection = () => {
  const [showMore, setShowMore] = useState(false);

  const mainCategories = [
    { id: 1, name: 'Government services', icon: '📋' },
    { id: 2, name: 'Banking & Finance', icon: '💰' },
    { id: 3, name: 'Education & Learning', icon: '🏫' },
    { id: 4, name: 'Transport', icon: '🚗' },
    { id: 5, name: 'Health & Insurance', icon: '🏥' },
    { id: 6, name: 'Other Documents', icon: '📄' },
  ];

  const moreCategories = [
    { id: 7, name: 'Legal', icon: '⚖️' },
    { id: 8, name: 'Property', icon: '🏠' },
    { id: 9, name: 'Employment', icon: '💼' },
  ];

  const displayedCategories = showMore 
    ? [...mainCategories, ...moreCategories] 
    : mainCategories;

  return (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.viewAllText}>
            {showMore ? 'View less' : 'View all'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesGrid}>
        {displayedCategories.map(category => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoriesSection;