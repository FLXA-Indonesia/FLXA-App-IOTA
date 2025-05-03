import globals from "@/assets/global-styles/gs";
import { useRouter, RelativePathString } from "expo-router";
import { getLocalItem, setLocalItem } from "@/utilities/asyncStorageHelper";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  Pressable,
  TextInput,
  ToastAndroid,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { providerLogoMapping } from "@/constants/Providers";
import type { Provider } from "@/constants/Providers";
import Button from "@/components/Button";
import axios, { isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const operatorMapping: Record<string, string> = {
  "58fbf693-3363-4066-9ac3-489288d950c9": "Telkomsel",
  "0dbfa48b-4d97-4ce3-acbc-84910b911e1e": "XL Axiata",
  "c9b0f2b1-f9e4-4105-9e61-614024fbcdb3": "Indosat",
};

export default function AddCardScreen() {
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
    mainSectionSubTitle: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 15,
      paddingBottom: 15,
    },
  });

  const router = useRouter();
  const providers: Provider[] = ["Telkomsel", "Indosat", "XL Axiata"];
  const [selectedProvider, setSelectedProvider] = useState<Provider>(providers[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    router.push("/dashboard");
  };

  const handleAddCard = async () => {
    const operatorId = Object.keys(operatorMapping).find((key) => operatorMapping[key] === selectedProvider);
    const token = await getLocalItem("token");
    setIsLoading(true);
    axios
      .post(
        process.env.EXPO_PUBLIC_FLXA_CARD_SERVICE + "/card/add",
        {
          phoneNumber: `+62${phoneNumber}`,
          operatorId: operatorId,
        },
        {
          headers: {
            authorization: `token ${token}`,
          },
        }
      )
      .then(() => {
        ToastAndroid.show("Card added! Please verify using OTP", 1000);
        setLocalItem("addedPhoneNumber", JSON.stringify(`+62${phoneNumber}`));
        router.replace("/auth/otp?type=add-card&phoneNumber=" + `+62${phoneNumber}` as RelativePathString);
      })
      .catch((err) => {
        if (isAxiosError(err)) {
          console.log(err);
          return ToastAndroid.show("Error occurred", 1000);
        }
        ToastAndroid.show("An error occured", 1000);
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
            <Text style={styles.mainSectionTitle}>Add New Card</Text>

            <View>
              <Text style={styles.mainSectionSubTitle}>Select Provider</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 14,
                  paddingBottom: 25,
                }}
              >
                {providers.map((provider) => {
                  const isTheSelectedProvider = selectedProvider == provider;
                  return (
                    <Pressable
                      onPress={() => {
                        setSelectedProvider(provider);
                      }}
                      style={{
                        borderWidth: isTheSelectedProvider ? 2 : 0.3,
                        borderColor: isTheSelectedProvider
                          ? globals.colors.purple.primary
                          : globals.colors.neutral.gray,
                        width: "30%",
                        flexBasis: "auto",
                        alignSelf: "flex-start",
                        justifyContent: "center",
                        alignItems: "center",
                        aspectRatio: 1,
                        borderRadius: 7,
                        backgroundColor: isTheSelectedProvider
                          ? globals.colors.purple.secondary
                          : globals.colors.neutral.white,
                      }}
                      key={provider}
                    >
                      <Image
                        style={{ width: 75, height: 75 }}
                        source={providerLogoMapping[provider]}
                      />
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.mainSectionSubTitle}>Input Phone Number</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    borderWidth: 0.3,
                    borderColor: globals.colors.neutral.gray,
                    borderRadius: 7,
                    height: 40,
                    alignItems: "center",
                    flexBasis: "auto",
                    alignSelf: "flex-start",
                    justifyContent: "center",
                    paddingHorizontal: 11,
                  }}
                >
                  <Text style={{ fontFamily: globals.fontStyles.fontRegular }}>+62</Text>
                </View>

                <TextInput
                  placeholder="8XXXXXXXXXXXX"
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 0.3,
                    borderColor: globals.colors.neutral.gray,
                    borderRadius: 7,
                    fontFamily: globals.fontStyles.fontRegular,
                    fontSize: 14,
                    flex: 1,
                    paddingHorizontal: 10,
                  }}
                  value={phoneNumber}
                  onChangeText={(newText) => {
                    setPhoneNumber(newText);
                  }}
                />
              </View>
            </View>

            <Button
              type="primary"
              onPress={handleAddCard}
              style={{
                marginTop: 20,
                opacity: phoneNumber.length < 10 ? 0.5 : 1,
              }}
              disabled={phoneNumber.length < 10 || isLoading}
            >
              <Text
                style={{ fontFamily: globals.fontStyles.fontBold, color: globals.colors.neutral.white, fontSize: 16 }}
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
