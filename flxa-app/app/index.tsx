import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ImageStyle, StyleSheet, Text, ToastAndroid, View } from "react-native";

export default function LandingPage() {
  const router = useRouter();
  const landingScreenStyles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.purple.primary,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 106,
      height: 137,
    },
    text: {
      color: "#FBFBFB",
      fontSize: 25,
      textAlign: "center",
    },
    buttonText: {
      textAlign: "center",
      color: globals.colors.purple.primary,
      fontSize: 16,
      fontFamily: globals.fontStyles.fontBold,
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleButtonPress = () => {
    setIsLoading(true);
    AsyncStorage.getItem("token", (err, token) => {
      if (!token || token == "") {
        return router.replace("/auth/login");
      }

      axios
        .get(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + `/check-session?token=${token}`, {
          timeout: 1000 * 5,
        })
        .then(() => {
          router.replace("/dashboard");
        })
        .catch((err: unknown) => {
          if (isAxiosError(err)) {
            const serverResponded = err.response != undefined;
            const noResponse = err.request != undefined;
            if (serverResponded) {
              router.replace("/auth/login");
              return ToastAndroid.show(err.response?.data.message, 1000);
            }
            if (noResponse) {
              return ToastAndroid.show("Connection or network error", 1000);
            }
            return ToastAndroid.show(err.message, 1000);
          }
          if (err instanceof Error) {
            ToastAndroid.show(err.message, 1000);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  return (
    <View style={landingScreenStyles.main}>
      <View style={[landingScreenStyles.main, { gap: 155 }]}>
        <Image
          source={require("@/assets/images/logo-transparent.png")}
          style={landingScreenStyles.logo as ImageStyle}
        />
        <View style={{ gap: 34 }}>
          <Text style={landingScreenStyles.text}>Ease starts here.</Text>

          <Button
            style={{ width: 280 }}
            onPress={handleButtonPress}
            type="secondary"
            disabled={isLoading}
          >
            <Text style={landingScreenStyles.buttonText}>Start!</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
