import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  TextInput,
  ToastAndroid,
} from "react-native";
import globals from "@/assets/global-styles/gs";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button, { buttonTextStyles } from "@/components/Button";
import axios from "axios";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import { providerLogoMapping } from "@/constants/Providers";
import type { ImageSourcePropType } from "react-native"
import type { Provider } from "@/constants/Providers"

export default function MobileCreditTopUpScreen() {
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
    input: {
      borderRadius: 7,
      borderColor: globals.colors.neutral.gray,
      borderWidth: 0.3,
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 20,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flex: 1,
    },
  });

  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const { phoneNumber: rawPhoneNumber, provider } = useLocalSearchParams<{ phoneNumber: string, provider: string }>();
  const phoneNumber = rawPhoneNumber ? `+${rawPhoneNumber.replace(/\s+/g, '')}` : '';

  const handleBack = () => {
    router.push("/top-up");
  };

  const handleContinue = async () => {
    if (isLoading) {
      ToastAndroid.show("Please wait...", 1000)
      return
    }
    if (amount < 1000) {
      return ToastAndroid.show("Minimum top up amount is Rp1.000", 1000);
    }
    setIsLoading(true)
    const token = await getLocalItem("token");
    axios.post(process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + '/transaction/charge/mobile-credit', {
        phoneNumber,
        amount
    }, {
        headers: {
            Authorization: `token ${token}`
        },
    })
    .then(() => {
        ToastAndroid.show("Balance added successfully!", 1000)
        router.replace("/top-up")
    })
    .catch((err) => {
        console.log(err);
        ToastAndroid.show("Balance insufficient!", 1000);
    })
    .finally(() => {
      setIsLoading(false)
    })
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

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
            <Text style={styles.mainSectionTitle}>Top Up Using Mobile Credit</Text>

            <View style={{ justifyContent: "space-between", flex: 1 }}>
              <View style={{ gap: 12 }}>
              <Image style={{width: 75, height: 75, alignSelf: "center"}} source={providerLogoMapping[provider as Provider]} />
              <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 15 }}>Phone Number</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 20 }}>
                  <TextInput
                    style={[styles.input, { backgroundColor: "#f0f0f0", color: "#a0a0a0" }]}
                    value={String(phoneNumber)}
                    editable={false}
                  />
                </View>

                <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 15 }}>Top Up Amount</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 20 }}>
                  <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 16, flexBasis: "auto" }}>Rp</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(amount)}
                    onChangeText={(text) => setAmount(Number(text))}
                  />
                </View>
              </View>

              <Button
                onPress={handleContinue}
                type="primary"
                disabled={isLoading}
                style={{opacity: isLoading || amount < 1000 ? .7 : 1}}
              >
                <Text style={[buttonTextStyles.primary, { fontSize: 16 }]}>Continue</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
