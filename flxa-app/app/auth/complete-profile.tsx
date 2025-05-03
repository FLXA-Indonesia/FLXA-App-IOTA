import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import FormTextInput from "@/components/FormTextInput";
import { getLocalItem, setLocalItem } from "@/utilities/asyncStorageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text, Pressable, Image, ToastAndroid } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfileScreen() {
  const styles = StyleSheet.create({
    main: {
      minHeight: "100%",
      backgroundColor: globals.colors.neutral.white,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    text: {
      fontSize: 28,
      fontFamily: globals.fontStyles.fontBold,
      marginBottom: 50,
      color: globals.colors.purple.primary,
    },
    photoView: {
      width: 95,
      height: 95,
      borderRadius: 200,
      backgroundColor: globals.colors.purple.primary,
      marginBottom: 10,
    },
    editPhotoButton: {
      width: 33,
      height: 33,
      position: "absolute",
      bottom: 0,
      right: 0,
      borderRadius: 66,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const router = useRouter();
  const [editButtonTouched, setEditButtonTouched] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const { userId } = useLocalSearchParams();

  const handleEditPhoto = () => {
    console.log("Edit Photo");
  };

  const updateLocalUserEmail = async (email: string) => {
    const currentUser = await getLocalItem("user");
    const parsed = JSON.parse(currentUser as string);

    const newUser = { email: email, id: parsed.id, name: parsed.name };
    await setLocalItem("user", JSON.stringify(newUser));
  };

  const handleSubmit = () => {
    axios
      .patch(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + `/complete-profile?userId=${userId}`, {
        email,
      })
      .then(() => {
        ToastAndroid.show("Success", 1000);
        router.replace("/dashboard");
        updateLocalUserEmail(email)
      })
      .catch((err) => {
        console.log(err);
        ToastAndroid.show(err.message, 1000);
      });
  };

  const getUser = async () => {
    return await AsyncStorage.getItem("user");
  };

  const initUser = async () => {
    const user = await getUser();
    const parsed = JSON.parse(user as string);
    setName(parsed.name);
  };

  useEffect(() => {
    initUser();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <Text style={styles.text}>Add photo and email to complete your profile</Text>

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <View style={styles.photoView}>
              <Pressable
                onPressIn={() => setEditButtonTouched(true)}
                onPressOut={() => setEditButtonTouched(false)}
                onPress={handleEditPhoto}
                style={[
                  styles.editPhotoButton,
                  editButtonTouched
                    ? { backgroundColor: globals.colors.neutral.gray }
                    : { backgroundColor: globals.colors.purple.secondary },
                ]}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  source={require("@/assets/images/EditIcon.png")}
                />
              </Pressable>
            </View>
            <Text style={{ textAlign: "center", fontFamily: globals.fontStyles.fontBold, fontSize: 20 }}>{name}</Text>
          </View>

          <View style={{ marginTop: 35, gap: 40 }}>
            <FormTextInput
              placeholder="Email"
              state={email}
              setState={setEmail}
              type="text"
            />

            <View style={{ gap: 10 }}>
              <Button
                type="primary"
                onPress={handleSubmit}
              >
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    color: globals.colors.neutral.white,
                    fontSize: 16,
                  }}
                >
                  Submit
                </Text>
              </Button>
              <Button
                type="secondary"
                onPress={() => {
                  router.replace("/dashboard");
                }}
              >
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    color: globals.colors.purple.primary,
                    fontSize: 16,
                  }}
                >
                  Skip for now
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
