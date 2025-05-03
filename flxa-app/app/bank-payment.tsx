import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ToastAndroid,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import globals from "@/assets/global-styles/gs";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button, { buttonTextStyles } from "@/components/Button";
import { bankLogoMapping } from "@/constants/Banks";
import type { Bank } from "@/constants/Banks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import axios from "axios";

export default function BankPaymentScreen() {
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

  const { bank, virtualAccount, orderId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const windowWidth = Dimensions.get("window").width;

  const handleBack = () => {
    router.push("/top-up");
  };

  const handleCheckPayment = async () => {
    console.log(virtualAccount, orderId);
    const token = await getLocalItem("token");
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + `/transaction/check-payment?orderId=${orderId}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      .then((res) => {
        if (res.data.message == "Payment success") {
          ToastAndroid.show("Payment success", 1000);
          router.replace("/success?message=Payment%20Success&route=top-up");
        } else {
          ToastAndroid.show("Payment pending", 1000);
        }
      })
      .catch(() => {
        ToastAndroid.show("Failed to check payment", 1000);
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
              style={{ width: 75, height: 75, alignSelf: "center" }}
              source={bankLogoMapping[bank as Bank] as ImageSourcePropType}
            />

            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "center", paddingTop: 35 }}>
              <View>
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    fontSize: 15,
                    textAlign: "center",
                    paddingBottom: 15,
                  }}
                >
                  Virtual Account Number
                </Text>
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    fontSize: 30,
                    textAlign: "center",
                    paddingBottom: 15,
                  }}
                >
                  {virtualAccount}
                </Text>
              </View>

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
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
