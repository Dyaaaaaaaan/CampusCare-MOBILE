import SecureVaultDemo from "@/components/secure-vault-demo";
import { ScrollView, StyleSheet } from "react-native";

export default function VaultScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SecureVaultDemo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, backgroundColor: "#f1f5f9", padding: 22 },
});
