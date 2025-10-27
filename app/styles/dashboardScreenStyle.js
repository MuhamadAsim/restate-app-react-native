import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navIconImage: {
  width: 20,
  height: 20,
  marginBottom: 2,
  tintColor: '#fff', // This makes the icon white to match your navbar
},
  navbar: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dashboardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primary,
  },
  searchIcon: {
    padding: 5,
  },
  navActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonContent: {
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  iconText: {
    fontSize: 18,
  },
  filtersPanel: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.primary,
    fontSize: 14,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  clearFiltersText: {
    color: "#fff",
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: "#999",
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  documentsList: {
    padding: 15,
  },
  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    flex: 1,
  },
  documentBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  documentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  documentSize: {
    fontSize: 13,
    color: "#666",
  },
  documentDate: {
    fontSize: 13,
    color: "#666",
  },
  documentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  syncBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  offlineBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4444" + "10",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalBody: {
    width: "100%",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
    marginTop: 15,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryOptionTextActive: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 25,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  modalDocTitle: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  // Add these to your existing styles
bannerWrapper: {
  marginBottom: 20,
  paddingHorizontal: 20,
},
bannerScrollContent: {
  paddingRight: 0,
},
scrollableBanner: {
  marginRight: 0,
  borderRadius: 16,
  padding: 20,
  minHeight: 140,
  justifyContent: 'space-between',
},
bannerTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: 'white',
  marginBottom: 8,
},
bannerSubtitle: {
  fontSize: 14,
  color: 'rgba(255,255,255,0.9)',
  lineHeight: 20,
},
bannerIndicators: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
},
dotContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 12,
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#ddd',
  marginHorizontal: 4,
},
dotActive: {
  backgroundColor: '#667eea',
  width: 24,
}
});








