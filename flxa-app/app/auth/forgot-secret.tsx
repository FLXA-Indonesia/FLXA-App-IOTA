import globals from "@/assets/global-styles/gs";
import Button, { buttonTextStyles } from "@/components/Button";
import FormTextInput from "@/components/FormTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View, ViewStyle } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  main: {
    backgroundColor: globals.colors.neutral.white,
    minHeight: "100%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 28,
    fontFamily: globals.fontStyles.fontBold,
    marginBottom: 60,
  },
  primaryButtonText: {
    ...buttonTextStyles.primary,
    fontSize: 16,
  },
  secondaryButtonText: {
    ...buttonTextStyles.secondary,
    fontSize: 16,
  },
});

export default function ForgotSecretScreen() {
  const { phoneNumberQuery } = useLocalSearchParams();
  const [phoneNumber, setPhoneNumber] = useState(phoneNumberQuery ? "+" + phoneNumberQuery: "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSend = () => {
    setIsLoading(true);
    if (phoneNumber.length < 10) {
      return ToastAndroid.show("Invalid phone number", 1000);
    }
    axios
      .post(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + "/generate-secret", {
        phoneNumber: phoneNumber.replace("+", ""),
      })
      .then(() => {
        ToastAndroid.show("New secret sent to your phone", 1000);
        if(phoneNumberQuery != undefined) {
          return router.replace("/settings");
        }
        router.replace("/auth/login");
      })
      .catch((err: unknown) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.request != undefined;
          if (serverResponded) {
            ToastAndroid.show(err.response?.data.message, 1000);
          } else if (noResponse) {
            ToastAndroid.show("Connection or network error", 1000);
          } else {
            ToastAndroid.show("An error occurred", 1000);
          }
        } else {
          ToastAndroid.show("An error occurred", 1000);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <Text style={styles.text}>Enter your registered phone number</Text>

          <View style={{ gap: 24, marginBottom: 40 }}>
            <FormTextInput
              placeholder="Registered Phone Number"
              state={phoneNumber}
              setState={setPhoneNumber}
              type="number"
              onFocus={() =>
                setPhoneNumber((prev) => {
                  if (prev.startsWith("+62")) return prev;
                  return prev + "+62";
                })
              }
            />
          </View>

          <View style={{ gap: 16, marginBottom: 80 }}>
            <Button
              onPress={handleSend}
              type="primary"
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>Send New Secret</Text>
            </Button>
          </View>

          <View style={{ justifyContent: "center" }}>
            <Pressable
              style={{ paddingVertical: 5 }}
              onPress={() => {
                router.back();
              }}
            >
              <Text
                style={{
                  color: globals.colors.purple.primary,
                  fontFamily: globals.fontStyles.fontRegular,
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
