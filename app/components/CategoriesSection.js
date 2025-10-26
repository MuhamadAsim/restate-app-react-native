import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/dashboardStyle';
import { useRouter, usePathname } from 'expo-router';

const CategoriesSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  
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

  // Navigate to documents screen with category filter
  const handleCategoryPress = (category) => {
    if (pathname !== "/DocumentsScreen") {
      router.push({
        pathname: "/DocumentsScreen",
        params: {
          category: category.name,
          filterType: "category"
        }
      });
    }
  };

  // Toggle show more/less
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={toggleShowMore}>
          <Text style={styles.viewAllText}>
            {showMore ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesGrid}>
        {displayedCategories.map(category => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoriesSection;