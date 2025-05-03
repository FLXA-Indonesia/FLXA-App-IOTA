import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import FormTextInput from "@/components/FormTextInput";
import { getLocalItem, setLocalItem } from "@/utilities/asyncStorageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  BackHandler,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
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
      paddingTop: 42,
      paddingHorizontal: 16,
      gap: 8,
    },
    profilePicture: {
      width: 95,
      height: 95,
      backgroundColor: globals.colors.purple.primary,
      borderRadius: 200,
    },
  });

  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [id, setId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialize = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        return;
      }
      const parsed = JSON.parse(user);
      setName(parsed.name);
      setEmail(parsed.email);
      setId(parsed.id);
    } catch (err) {
      return;
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBack = () => {
    router.push("/profile");
  };

  const handleEdit = async () => {
    console.log(name + " " + email);
    const token = await getLocalItem("token");
    if (name == "") {
      return ToastAndroid.show("Name cannot be empty", 1000);
    }

    if (email == "") {
      return ToastAndroid.show("Email cannot be empty", 1000);
    }

    if (!email.includes("@") || !email.includes(".")) {
      return ToastAndroid.show("Invalid email", 1000);
    }

    setIsLoading(true);
    axios
      .put(
        process.env.EXPO_PUBLIC_FLXA_USER_SERVICE + "/user/edit",
        {
          name: name,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        const newUser = { id: id, name: name, email: email };
        setLocalItem("user", JSON.stringify(newUser));
        ToastAndroid.show("Success", 1000);
      })
      .catch((err) => {
        console.log(err);
        ToastAndroid.show("Error editing profile", 1000);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.profilePicture} />
              <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 20, marginTop: 10 }}>{name}</Text>
            </View>

            <View style={{ gap: 24 }}>
              <FormTextInput
                placeholder="Name"
                state={name}
                setState={setName}
                type="text"
              />
              <FormTextInput
                placeholder="Email"
                state={email}
                setState={setEmail}
                type="email"
              />
            </View>

            <Button
              type="primary"
              onPress={handleEdit}
              style={{ marginTop: 80 }}
              disabled={isLoading}
            >
              <Text
                style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 16, color: globals.colors.neutral.white }}
              >
                Edit
              </Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
