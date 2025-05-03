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
import { useRouter } from "expo-router";
import Button, { buttonTextStyles } from "@/components/Button";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import axios, { isAxiosError } from "axios";
import { parse } from "@babel/core";

export default function WalletTopUpScreen() {
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

  const handleBack = () => {
    router.push("/top-up");
  };

  const handleContinue = async () => {
    if (amount < 10000) {
      return ToastAndroid.show("Minimum top up amount is Rp10.000", 1000);
    }

    const token = await getLocalItem("token");
    const card = await getLocalItem("cards");
    const parsedCard = JSON.parse(card as string);
    setIsLoading(true);
    axios
      .post(
        process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + "/transaction/charge/qris",
        {
          amount,
          phoneNumber: parsedCard[0].card_phone_number
        },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data)
        ToastAndroid.show("QRIS link is sent to your primary phone number for backup", 1000)
        router.push(
          `/qris-payment?qris_string=${res.data.data.qr_string}&expiry_time=${res.data.data.expiry_time}&order_id=${res.data.data.order_id}`
        );
      })
      .catch((err: unknown) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.response != undefined;
          if (serverResponded) {
            console.log(err.response?.data?.error);
            ToastAndroid.show(err.message, 1000);
            return;
          }
          if (noResponse) {
            console.log(err.request);
            ToastAndroid.show("Connection or network error", 1000);
            return;
          }
          console.log(err.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
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
            <Text style={styles.mainSectionTitle}>Top Up Using QRIS</Text>

            <View style={{ justifyContent: "space-between", flex: 1 }}>
              <View style={{ gap: 12 }}>
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
