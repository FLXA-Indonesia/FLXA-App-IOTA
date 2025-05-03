import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, ScrollView, StyleSheet, View, TouchableOpacity, Image, ToastAndroid } from "react-native";
import globals from "@/assets/global-styles/gs";
import { useRouter } from "expo-router";
import ProfileMenu from "@/components/ProfileMenu";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useState } from "react";

export default function SettingsScreen() {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.purple.primary,
      minHeight: "100%",
    },
    mainSection: {
      backgroundColor: globals.colors.neutral.white,
      borderTopLeftRadius: 23,
      borderTopRightRadius: 23,
      flex: 1,
      paddingBottom: 60,
      paddingTop: 28,
      paddingHorizontal: 16,
    },
    mainSectionTitle: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 20,
      textAlign: "center",
      paddingBottom: 35,
    },
  });

  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const router = useRouter();

  const handleBack = () => {
    router.push("/profile");
  };

  const handleLogOutAll = () => {
    if (isLoading) {
      return;
    }
    AsyncStorage.getItem("token", (_, token) => {
      if (token == "") {
        ToastAndroid.show("Token not found", 1000);
      }
      setIsLoading(true);
      axios
        .get(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + `/logout?token=${token}`)
        .then(() => {
          ToastAndroid.show("Log out success", 1000);
          AsyncStorage.clear();
          router.replace("/");
        })
        .catch((err: unknown) => {
          if (isAxiosError(err)) {
            return ToastAndroid.show(
              err?.request?._response ? JSON.parse(err.request._response).message : err.message,
              1000
            );
          }
          ToastAndroid.show("An error occured", 1000);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const handleNewSecret = async () => {
    const cards = await getLocalItem("cards");
    const parsed = JSON.parse(cards as string);
    const phoneNumber = parsed[0].card_phone_number.replace("+", "").replace(" ", "");
    console.log(phoneNumber);
    router.push(`/auth/forgot-secret?phoneNumberQuery=${phoneNumber}`);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              paddingHorizontal: 14,
              paddingTop: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingBottom: 33,
              flexBasis: "auto",
              alignSelf: "flex-start",
            }}
          >
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/BackArrow.png")}
            />
            <Text
              style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 14, color: globals.colors.neutral.white }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Settings</Text>
            <ProfileMenu
              mainText="New Secret"
              icon={require("@/assets/images/RegenerateIcon.png")}
              onPress={handleNewSecret}
              subText="Get a new secret key"
            />
            <ProfileMenu
              mainText="Log Out All Devices"
              icon={require("@/assets/images/LogOutIcon.png")}
              onPress={handleLogOutAll}
              subText="Remove session from all logged in devices"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
