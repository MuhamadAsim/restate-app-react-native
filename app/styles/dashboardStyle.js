// app/styles/dashboardStyle.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 0,
  },
  showMoreText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
    marginTop: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom nav
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  profileDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  navbarRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },

  // Banners
  adBanner: {
    width: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    marginBottom: 20,
  },
  banner1: {
    backgroundColor: "#ec87a9ff",
  },
  banner2: {
    backgroundColor: "#e0e0e0",
    flex: 1,
    marginLeft: 8,
    marginRight: 0,
    marginBottom: 0,
    paddingVertical: 30,
  },
  banner2Small: {
    minHeight: 100,
  },
  banner3: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 40,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },

  // Categories Section
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "30%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 90,
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 13,
    paddingHorizontal: 2,
  },

  // Documents section
  documentsSection: {
    marginBottom: 20,
  },
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  documentCard: {
    width: "30%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 90,
    justifyContent: "center",
  },
  docIcon: {
    fontSize: 28,
  },
  docName: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  moreCard: {
    backgroundColor: "#10b981",
  },
  moreIcon: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 24,
    height: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    margin: 2,
  },
  moreCardText: {
    color: "white",
  },

  // Coming Soon Section
  comingSoonSection: {
    marginBottom: 24,
  },
  comingSoonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
 comingSoonCard: {
  width: "23%",  // Changed from 22.5% to 23%
  backgroundColor: "white",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#e0e0e0",
  minHeight: 90,
  justifyContent: "center",
},
  comingSoonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  comingSoonName: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 13,
    paddingHorizontal: 2,
  },

  // New Update Banner
  newUpdateBanner: {
    backgroundColor: "#8b5cf6",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  updateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  updateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // Promotions Section
  promotionsSection: {
    marginBottom: 20,
  },
  promotionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  promotionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promotionIcon: {
    fontSize: 28,
  },
  promotionTextContainer: {
    gap: 4,
  },
  promotionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  promotionSubtitle: {
    fontSize: 12,
    color: "#888",
  },

  // Bottom section
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  notesCard: {
    flex: 1,
    backgroundColor: "#10b981",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    marginRight: 0,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    marginTop: 8,
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 12,
    height: 70,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navItemText: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  navItemActive: {
    color: "#667eea",
  },
  addBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  addCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;


