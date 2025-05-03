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
import type { ImageSourcePropType } from "react-native";
import globals from "@/assets/global-styles/gs";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button, { buttonTextStyles } from "@/components/Button";
import QRCode from "react-native-qrcode-svg";
import axios, { isAxiosError } from "axios";
import { getLocalItem } from "@/utilities/asyncStorageHelper";

export default function QrisPaymentScreen() {
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

  const { qris_string, expiry_time, order_id } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleBack = () => {
    router.push("/top-up");
  };

  const handleCheckPayment = async () => {
    const token = await getLocalItem("token");
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + `/transaction/check-payment?orderId=${order_id}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data.message);
        ToastAndroid.show(res.data.message, 1000);
        const paymentSuccess = res.data.message == "Payment success"
        if(paymentSuccess) {
          router.replace("/success?message=Payment%20Success&route=top-up")       
        }
      })
      .catch((err: unknown) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.request != undefined;
          if (serverResponded) {
            console.log(err.response);
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
            <Image
              style={{ width: 75, height: 28, alignSelf: "center" }}
              source={require("@/assets/images/QrisLogo.png")}
            />

            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "center", paddingTop: 35 }}>
              <View>
                {qris_string ? (
                  <QRCode
                    size={250}
                    value={qris_string as string}
                  />
                ) : (
                  <View>
                    <View
                      style={{
                        width: 215,
                        height: 215,
                        backgroundColor: globals.colors.purple.secondary,
                        borderRadius: 7,
                      }}
                    />
                  </View>
                )}

                {expiry_time != null && (
                  <Text style={{ fontFamily: globals.fontStyles.fontRegular, textAlign: "center", paddingTop: 20 }}>
                    Valid until <Text style={{ fontFamily: globals.fontStyles.fontBold }}>{expiry_time}</Text>
                  </Text>
                )}
              </View>

              <View style={{ width: "100%" }}>
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontRegular,
                    fontSize: 15,
                    paddingBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Scan the QR using your preferred wallet
                </Text>
                <Button
                  onPress={handleCheckPayment}
                  type="primary"
                  style={{ width: "100%" }}
                  disabled={isLoading}
                >
                  <Text style={[buttonTextStyles.primary, { fontSize: 16 }]}>Check Payment</Text>
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
