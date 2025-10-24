import { StyleSheet } from "react-native";
import colors from "../../constants/colors"; // adjust the path if needed
//
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.primary,
  },
  profilePlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cameraIcon: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
  },
  settingDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  biometricType: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontStyle: "italic",
  },
  settingArrow: {
    fontSize: 24,
    color: colors.primary,
    marginLeft: 10,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 2,
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonDanger: {
    backgroundColor: "#FF3B30",
  },
  modalButtonTextDanger: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonTextCancel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalActionButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalActionButtonSave: {
    backgroundColor: colors.primary,
  },
  modalActionTextCancel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalActionTextSave: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageOptionActive: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  languageOptionText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "bold",
  },
});

