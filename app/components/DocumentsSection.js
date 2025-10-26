import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/dashboardStyle';
import { useRouter, usePathname } from 'expo-router';

const DocumentsSection = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [showMore, setShowMore] = useState(false);

  // all document tags
  const quickTags = [
    { id: 1, name: "National Id", icon: "🪪" },
    { id: 2, name: "Driving Licence", icon: "📝" },
    { id: 3, name: "Citizenship", icon: "📜" },
    { id: 4, name: "Passport", icon: "📘" },
    { id: 5, name: "Voter Id", icon: "🪑" },
    { id: 6, name: "Birth Certificate", icon: "👶" },
    { id: 7, name: "Insurance", icon: "🛡️" },
    { id: 8, name: "Contract", icon: "📋" },
  ];

  // show only 5 first, others hidden until 'More' pressed
  const visibleTags = showMore ? quickTags : quickTags.slice(0, 5);

  // Navigate to documents screen with tag filter
  const handleDocumentPress = (tag) => {
    if (pathname !== "/DocumentsScreen") {
      // Pass tag as query parameter to filter documents
      router.push({
        pathname: "/DocumentsScreen",
        params: {
          tag: tag.name,
          filterType: "tag"
        }
      });
    }
  };

  // Navigate to documents screen showing all documents
  const handleSeeAllPress = () => {
    if (pathname !== "/DocumentsScreen") {
      router.push({
        pathname: "/DocumentsScreen",
        params: {
          tag: null,
          category: null,
          filterType: null
        }
      });
    }
  };

  // Toggle More/Less
  const toggleMore = () => {
    setShowMore((prev) => !prev);
  };

  return (
    <View style={styles.documentsSection}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Grid of document tags */}
      <View style={styles.documentsGrid}>
        {visibleTags.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.documentCard}
            onPress={() => handleDocumentPress(doc)}
          >
            <Text style={styles.docIcon}>{doc.icon}</Text>
            <Text style={styles.docName}>{doc.name}</Text>
          </TouchableOpacity>
        ))}

        {/* More / Less Button */}
        <TouchableOpacity
          style={[styles.documentCard, styles.moreCard]}
          onPress={toggleMore}
        >
          <View style={styles.moreIcon}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
          <Text style={[styles.docName, styles.moreCardText]}>
            {showMore ? "Less" : "More"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentsSection;