// Main Dashboard Component (App.js)
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Import components
import Navbar from './components/NavbarDashboard';
import DocumentsSection from './components/DocumentsSection';
import CategoriesSection from './components/CategoriesSection';
import ComingSoonSection from './components/ComingSoonSection';
import PromotionsSection from './components/PromotionsSection';
import BottomNav from './components/BottomNavbar';
import styles from './styles/dashboardStyle';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Folder"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Advertisement Banner 1 */}
        <View style={[styles.adBanner, styles.banner1]}>
          <Text style={styles.bannerText}>Banner screen 1</Text>
        </View>

        {/* Documents Section */}
        <DocumentsSection />

        {/* Bottom Section with Notes and Banner */}
        <View style={styles.bottomSection}>
          <View style={styles.notesCard}>
            <Icon name="file-text" size={24} color="white" />
            <Text style={styles.notesTitle}>New note</Text>
          </View>
          
          <View style={[styles.adBanner, styles.banner2, styles.banner2Small]}>
            <Text style={styles.bannerText}>Banner 2</Text>
          </View>
        </View>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Advertisement Banner 3 */}
        <View style={[styles.adBanner, styles.banner3]}>
          <Text style={styles.bannerText}>Banner screen 3</Text>
        </View>

        {/* Coming Soon Section */}
        <ComingSoonSection />

        {/* New Update Banner */}
        <View style={styles.newUpdateBanner}>
          <View style={styles.updateContent}>
            <Icon name="plus" size={20} color="white" />
            <Text style={styles.updateText}>New Update</Text>
          </View>
          <Icon name="check" size={24} color="white" />
        </View>

        {/* Promotions Section */}
        <PromotionsSection />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

export default App;