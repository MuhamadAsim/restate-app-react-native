// Main Dashboard Component (App.js)
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Import components
import BottomNav from './components/BottomNavbar';
import CategoriesSection from './components/CategoriesSection';
import ComingSoonSection from './components/ComingSoonSection';
import DocumentsSection from './components/DocumentsSection';
import Navbar from './components/NavbarDashboard';
import PromotionsSection from './components/PromotionsSection';
import styles from './styles/dashboardStyle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH * 0.93; // 88% of screen width
const BANNER_MARGIN = 15; // Space between banners

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const bannerScrollRef = useRef(null);

  // Scroll to middle banner on mount
  useEffect(() => {
    setTimeout(() => {
      if (bannerScrollRef.current) {
        // Adjusted scroll position for proper centering
        const centerPosition = BANNER_WIDTH / 80 + BANNER_MARGIN / 15;
        bannerScrollRef.current.scrollTo({
          x: centerPosition,
          animated: false,
        });
      }
    }, 150);
  }, []);


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

        {/* 3 Slideable Banners */}
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={BANNER_WIDTH + BANNER_MARGIN}
          snapToAlignment="center" // 👈 was "start"
          contentContainerStyle={{
            paddingHorizontal: (SCREEN_WIDTH - BANNER_WIDTH) / 2,
          }}
          style={{ marginBottom: 20 }}
        >

          {/* Banner 1A */}
          <View style={[
            styles.adBanner,
            {
              width: BANNER_WIDTH,
              backgroundColor: '#FF6B6B',
              marginRight: BANNER_MARGIN,
            }
          ]}>
            <Text style={styles.bannerText}>Banner 1A</Text>
            <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
              Swipe to explore more
            </Text>
          </View>

          {/* Banner 1B */}
          <View style={[
            styles.adBanner,
            {
              width: BANNER_WIDTH,
              backgroundColor: '#4ECDC4',
              marginRight: BANNER_MARGIN,
            }
          ]}>
            <Text style={styles.bannerText}>Banner 1B</Text>
            <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
              Welcome to your dashboard
            </Text>
          </View>

          {/* Banner 1C */}
          <View style={[
            styles.adBanner,
            {
              width: BANNER_WIDTH,
              backgroundColor: '#95E1D3',
            }
          ]}>
            <Text style={styles.bannerText}>Banner 1C</Text>
            <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
              Discover new features
            </Text>
          </View>
        </ScrollView>

        {/* Documents Section */}
        <DocumentsSection />

        {/* Bottom Section with Notes and Banner */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.notesCard}
            onPress={() => router.push('/NotesScreen')}
          >
            <Icon name="file-text" size={24} color="white" />
            <Text style={styles.notesTitle}>New note</Text>
          </TouchableOpacity>

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