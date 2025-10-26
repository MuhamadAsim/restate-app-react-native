import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../styles/dashboardStyle';

const PromotionsSection = () => {
  const promotions = [
    {
      id: 1,
      icon: '🎁',
      title: 'Offers & Promocodes',
      subtitle: 'View all offers & Promocodes',
      color: '#ff9800',
    },
    {
      id: 2,
      icon: '🎫',
      title: 'Raise a Support',
      subtitle: 'Raise a ticket',
      color: '#f44336',
    },
  ];

  const handlePress = (title) => {
    Alert.alert('🚧 Not Available', `${title} is currently not available.`);
  };

  return (
    <View style={styles.promotionsSection}>
      {promotions.map((promo) => (
        <TouchableOpacity
          key={promo.id}
          style={styles.promotionCard}
          onPress={() => handlePress(promo.title)}
          activeOpacity={0.7}
        >
          <View style={styles.promotionLeft}>
            <Text style={styles.promotionIcon}>{promo.icon}</Text>
            <View style={styles.promotionTextContainer}>
              <Text style={styles.promotionTitle}>{promo.title}</Text>
              <Text style={styles.promotionSubtitle}>{promo.subtitle}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color="#888" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PromotionsSection;
