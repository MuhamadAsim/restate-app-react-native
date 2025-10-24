import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.primary,
  },
  header: {
    marginBottom: 40,
  },
  welcome: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 5,
  },
  input: {
    borderBottomWidth: 1.5,
    borderColor: colors.primary,
    fontSize: 16,
    color: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginVertical: 10,
  },
  passwordContainer: {
    position: "relative",
    marginVertical: 10,
  },
  passwordInput: {
    borderBottomWidth: 1.5,
    borderColor: colors.primary,
    fontSize: 16,
    color: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 6,
    paddingRight: 45, // Space for eye icon
  },
  eyeButton: {
    position: "absolute",
    right: 5,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 5,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeOpen: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeClosed: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeOutline: {
    width: 20,
    height: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  eyeSlash: {
    position: "absolute",
    width: 22,
    height: 2,
    backgroundColor: colors.primary,
    transform: [{ rotate: "45deg" }],
    top: 11,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotText: {
    color: colors.primary,
    textAlign: "center",
    marginVertical: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
  },
  or: {
    marginHorizontal: 10,
    color: colors.primary,
  },
  socialTitle: {
    textAlign: "center",
    color: colors.primary,
    marginVertical: 10,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.primary,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default styles;