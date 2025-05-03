import globals from "@/assets/global-styles/gs";
import Button, { buttonTextStyles } from "@/components/Button";
import FormTextInput from "@/components/FormTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, 
  Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const loginScreenStyles = StyleSheet.create({
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

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secretString, setSecretString] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const saveToken = async (token: string) => {
    try {
      if (!token || token == "") {
        throw new Error("Token is empty");
      }
      await AsyncStorage.setItem("token", token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return ToastAndroid.show(err.message, 1000);
      }
      return ToastAndroid.show("Error saving to storage", 1000);
    }
  };

  const saveUser = async (user: string) => {
    try {
      await AsyncStorage.setItem("user", user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return ToastAndroid.show(err.message, 1000);
      }
      return ToastAndroid.show("Error saving to storage", 1000);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    if (phoneNumber.length < 10) {
      return ToastAndroid.show("Invalid phone number", 1000);
    }
    if (secretString == "") {
      return ToastAndroid.show("Secret string is empty", 1000);
    }
    axios
      .post(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + "/login", {
        phoneNumber,
        secretString,
      })
      .then((res) => {
        ToastAndroid.show("login success", 1000);
        saveToken(res.data.session);
        saveUser(JSON.stringify(res.data.user));
        router.push("/dashboard");
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
        <ScrollView contentContainerStyle={loginScreenStyles.main}>
          <Text style={loginScreenStyles.text}>Welcome Back!</Text>

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
            <FormTextInput
              placeholder="Secret String / Auth Code"
              state={secretString}
              setState={setSecretString}
              type="text"
            />
          </View>

          <View style={{ gap: 16, marginBottom: 80 }}>
            <Button
              onPress={handleLogin}
              type="primary"
              disabled={isLoading}
            >
              <Text style={loginScreenStyles.primaryButtonText}>Log In</Text>
            </Button>
            <Button
              onPress={() => {
                router.replace("/auth/register");
              }}
              type="secondary"
            >
              <Text style={loginScreenStyles.secondaryButtonText}>Register Phone Number</Text>
            </Button>
          </View>

          <View style={{ justifyContent: "center" }}>
            <Text
              style={{
                color: globals.colors.neutral.gray,
                fontFamily: globals.fontStyles.fontRegular,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Forgot your code?
            </Text>
            <TouchableOpacity
              style={{ paddingVertical: 5 }}
              onPress={() => {
                router.push("/auth/forgot-secret");
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
                Request new code
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
