import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, ScrollView, StyleSheet, View, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { RelativePathString } from "expo-router";

export default function SuccessScreen() {
  const styles = StyleSheet.create({
    main: {
      minHeight: "100%",
      backgroundColor: globals.colors.purple.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    checkContainer: {
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    },
    text: {
      textAlign: "center",
      fontFamily: globals.fontStyles.fontBold,
      color: globals.colors.neutral.white,
      fontSize: 30,
      paddingBottom: 10,
    },
  });

  const { message, route } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <View style={styles.checkContainer}>
            <Image
              style={{ width: 250, height: 250 }}
              source={require("@/assets/images/CheckIcon.png")}
            />
            <Text style={styles.text}>{message ? message : "Success"}</Text>
            <Button
              type="secondary"
              onPress={() => router.replace(route ? (`/${route}` as RelativePathString) : "/dashboard")}
              style={{ alignSelf: "stretch" }}
            >
              <Text
                style={{ fontFamily: globals.fontStyles.fontBold, color: globals.colors.purple.primary, fontSize: 16 }}
              >
                Continue
              </Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
