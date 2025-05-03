import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import ProfileMenu from "@/components/ProfileMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@/app/dashboard";

export default function ProfileScreen() {
  const icons = {
    profile: require("@/assets/images/ProfileIcon.png"),
    settings: require("@/assets/images/SettingsIcon.png"),
    help: require("@/assets/images/HelpIcon.png"),
    arrowRight: require("@/assets/images/ArrowRight.png"),
  };

  const styles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.neutral.white,
      minHeight: "100%",
      paddingHorizontal: 16,
      paddingBottom: 60,
    },
    container: { justifyContent: "center", alignItems: "center" },
    profilePicture: {
      width: 95,
      height: 95,
      backgroundColor: globals.colors.purple.primary,
      borderRadius: 200,
    },
  });

  const router = useRouter();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    id: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings")
  }

  const handleLogOut = () => {
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
          setIsLoading(false)
        })
    });
  };

  const handleHelp = () => {
    Linking.openURL("https://wa.me/+6285179764717");
  };

  useEffect(() => {
    AsyncStorage.getItem("user", (err, user) => {
      if(typeof user === "string") {
        const parsed = JSON.parse(user)
        setUser(parsed)
      }
    })
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top"]}
      >
        <ScrollView contentContainerStyle={styles.main}>
          <View style={[styles.container, { paddingTop: 105 }]}>
            <View style={styles.profilePicture} />
            <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 20, marginTop: 10 }}>{user.name}</Text>
            <Text style={{ fontFamily: globals.fontStyles.fontRegular, fontSize: 14 }}>{user.email}</Text>
          </View>

          <View style={[{ paddingTop: 80, paddingBottom: 95 }]}>
            <ProfileMenu
              icon={icons.profile}
              mainText="Profile"
              subText="View and Edit Profile"
              onPress={handleEditProfile}
            />
            <ProfileMenu
              icon={icons.settings}
              mainText="Settings"
              subText="Configure FLXA"
              onPress={handleSettings}
            />
            <ProfileMenu
              icon={icons.help}
              mainText="Help"
              subText="We're available 24/7!"
              onPress={handleHelp}
            />
          </View>

          <Button
            type="secondary"
            disabled={isLoading}
            onPress={() => {
              handleLogOut();
            }}
          >
            <Text
              style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 20, color: globals.colors.purple.primary }}
            >
              Log Out
            </Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
