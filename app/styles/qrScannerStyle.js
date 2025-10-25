import colors from "../../constants/colors";
import {
  Dimensions,
  StyleSheet,
} from "react-native";


const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.primary,
    zIndex: 10,
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  permissionIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    width: SCAN_AREA_SIZE - 40,
    height: 2,
    backgroundColor: colors.primary,
    position: "absolute",
    top: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanningIndicator: {
    position: "absolute",
    alignItems: "center",
  },
  scanningText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  hintText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  closeIcon: {
    fontSize: 24,
    color: "#999",
    fontWeight: "bold",
  },
  documentInfo: {
    marginBottom: 20,
  },
  documentIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  documentIconText: {
    fontSize: 60,
  },
  documentDetail: {
    marginBottom: 15,
  },
  documentDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  documentDetailHalf: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  detailDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtonSecondary: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;