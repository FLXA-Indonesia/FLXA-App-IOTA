import globals from "@/assets/global-styles/gs";
import TopUpOptionsRow from "@/components/TopUpOptionsRow";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import formatCurrency from "@/utilities/formatCurrency";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { TopUpOption } from "@/components/TopUpOptionsRow";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TopUpScreen() {
  const [topUpOptions, setTopUpOptions] = useState<any[]>([]);

  const styles = StyleSheet.create({
    main: {
      minHeight: "100%",
      backgroundColor: globals.colors.purple.primary,
    },
    topSectionContainer: {
      paddingHorizontal: 16,
      paddingTop: 110,
      paddingBottom: 34,
    },
    topSection: {
      backgroundColor: globals.colors.neutral.white,
      width: "100%",
      paddingTop: 25,
      paddingBottom: 16,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    topSectionSubText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 15,
      textAlign: "center",
      paddingBottom: 13,
    },
    topSectionMainText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 40,
      textAlign: "center",
      color: globals.colors.purple.primary,
      paddingBottom: 8,
    },
    bottomSection: {
      backgroundColor: globals.colors.neutral.white,
      width: "100%",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      flex: 1,
      paddingTop: 32,
      paddingBottom: 60,
      paddingHorizontal: 28,
      gap: 18,
    },
  });

  interface TopUpRows {
    method: string;
    options: TopUpOption[];
  }

  useEffect(() => {
    AsyncStorage.getItem("cards")
      .then((cards) => {
        if (cards) {
          const parsedCards: Array<{
            card_balance: string;
            card_date_added: string;
            card_id: number;
            card_phone_number: string;
            card_status: string;
            operator_id: string;
            operator_name: string;
            user_id: string;
          }> = JSON.parse(cards);

          const logoMap: Record<string, string> = {
            Telkomsel: require("@/assets/images/TselLogo.png"),
            Indosat: require("@/assets/images/IndosatLogo.png"),
            "XL Axiata": require("@/assets/images/XlLogo.png"),
          };

          const filteredOptions: TopUpRows[] = [
            {
              method: "Mobile Credit",
              options: parsedCards
                .filter((card) => ["Telkomsel", "XL Axiata", "Indosat"].includes(card.operator_name))
                .map((card) => ({
                  name: card.operator_name,
                  logo: logoMap[card.operator_name] as ImageSourcePropType,
                  method: "mobile",
                  phoneNumber: card.card_phone_number,
                })),
            },
            {
              method: "Credit Card",
              options: [
                {
                  name: "VISA",
                  logo: require("@/assets/images/VisaLogo.png"),
                  method: "credit",
                },
                {
                  name: "MasterCard",
                  logo: require("@/assets/images/MastercardLogo.png"),
                  method: "credit",
                },
                {
                  name: "American Express",
                  logo: require("@/assets/images/AmericanExpressLogo.png"),
                  method: "credit",
                },
              ],
            },
            {
              method: "e-Wallet",
              options: [
                {
                  name: "QRIS",
                  logo: require("@/assets/images/QrisLogo.png"),
                  method: "wallet",
                },
              ],
            },
            {
              method: "Bank Transfer",
              options: [
                {
                  name: "BNI",
                  logo: require("@/assets/images/BNILogo.png"),
                  method: "bank",
                },
                {
                  name: "BRI",
                  logo: require("@/assets/images/BRILogo.png"),
                  method: "bank",
                },
                {
                  name: "BCA",
                  logo: require("@/assets/images/BCALogo.png"),
                  method: "bank",
                },
              ],
            },
          ];

          setTopUpOptions(filteredOptions);
        }
      })
      .catch((err) => {
        console.error("Error fetching cards:", err);
      });
  }, []);

  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getBalance = async () => {
    const token = await getLocalItem("token");
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + "/balance/view", {
        headers: {
          authorization: `token ${token}`,
        },
      })
      .then((res) => {
        setBalance(Number(res.data.balance_amount));
      })
      .catch((err: unknown) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.request != undefined;
          if (serverResponded) {
            return ToastAndroid.show(err.response?.data.error, 1000);
          }
          if (noResponse) {
            return ToastAndroid.show("Connection or network error", 1000);
          }
          return ToastAndroid.show(err.message, 1000);
        }
        if (err instanceof Error) {
          ToastAndroid.show(err.message, 1000);
        }
        ToastAndroid.show("An error occurred", 1000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <View style={styles.topSectionContainer}>
            <View style={styles.topSection}>
              <Text style={styles.topSectionSubText}>FLXA Balance</Text>
              {balance != null ? (
                <Text style={styles.topSectionMainText}>Rp{formatCurrency(balance as number)}</Text>
              ) : (
                <View>
                  <View
                    style={{
                      width: 250,
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomSection}>
            {topUpOptions.map((options) => {
              return (
                <TopUpOptionsRow
                  key={options.method}
                  title={options.method}
                  options={options.options}
                />
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
