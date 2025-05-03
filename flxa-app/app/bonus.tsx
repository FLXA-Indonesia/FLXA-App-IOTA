import globals from "@/assets/global-styles/gs";
import type { Provider } from "@/constants/Providers";
import TopUpOptionsRow from "@/components/TopUpOptionsRow";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import formatCurrency from "@/utilities/formatCurrency";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View, Image, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { TopUpOption } from "@/components/TopUpOptionsRow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { useRouter } from "expo-router";
import type { ImageSourcePropType } from "react-native";

type DropdownOption = {
  value: string;
  label: Provider;
};

type Bonus = {
  title: string;
  type: string;
  description: string;
  valid_until: string;
  price: number;
  id: number;
};

export default function BonusScreen() {
  const router = useRouter();
  const [topUpOptions, setTopUpOptions] = useState<any[]>([]);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingBonus, setIsLoadingBonus] = useState<boolean>(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>("58fbf693-3363-4066-9ac3-489288d950c9");
  const providerOptions: DropdownOption[] = [
    {
      label: "Indosat",
      value: "c9b0f2b1-f9e4-4105-9e61-614024fbcdb3",
    },
    {
      label: "Telkomsel",
      value: "58fbf693-3363-4066-9ac3-489288d950c9",
    },
    {
      label: "XL Axiata",
      value: "0dbfa48b-4d97-4ce3-acbc-84910b911e1e",
    },
  ];
  const logoMap: Record<string, ImageSourcePropType> = {
    Telkomsel: require("@/assets/images/TselLogo.png"),
    Indosat: require("@/assets/images/IndosatLogo.png"),
    "XL Axiata": require("@/assets/images/XlLogo.png"),
  };

  function GetBonuses() {
    console.log(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/bonus?operatorId=" + selectedProvider);
    setIsLoadingBonus(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/bonus?operatorId=" + selectedProvider)
      .then((res) => {
        // console.log(res.data.data);
        setBonuses(res.data.data);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsLoadingBonus(false);
      });
  }

  async function handleRedeem(bonusId: number) {
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);
    const cards = await getLocalItem("cards");
    const parsedCards = JSON.parse(cards as string);
    console.log({
      userId: parsedUser.id,
      bonusId: String(bonusId),
      phone: parsedCards[0].card_phone_number
    })  
    axios.post(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/redeem", {
      userId: parsedUser.id,
      bonusId: String(bonusId),
      phone: parsedCards[0].card_phone_number,
    }).then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err.request)
    })
  }

  const styles = StyleSheet.create({
    main: {
      minHeight: "100%",
      backgroundColor: globals.colors.purple.primary,
    },
    dropdown: {
      borderBottomWidth: 2,
      paddingVertical: 13,
    },
    dropdownPlaceholderStyle: {
      fontFamily: globals.fontStyles.fontRegular,
      fontSize: 16,
      color: globals.colors.neutral.gray,
    },
    dropdownSelectedStyle: {
      fontFamily: globals.fontStyles.fontRegular,
      fontSize: 16,
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
    optionItem: {
      width: 50,
      minHeight: 100,
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.3,
      borderColor: globals.colors.neutral.gray,
      borderRadius: 7,
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

  useEffect(() => {
    GetBonuses();
  }, [selectedProvider]);

  const getBalance = async () => {
    const token = await getLocalItem("token");
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/amount/" + parsedUser.id, {
        headers: {
          authorization: `token ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setBalance(Number(res.data.data.amount));
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 14,
              paddingTop: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingBottom: 33,
              flexBasis: "auto",
              alignSelf: "flex-start",
              position: "absolute",
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
          <View style={styles.topSectionContainer}>
            <View style={styles.topSection}>
              <Text style={styles.topSectionSubText}>Your Tokens</Text>
              {balance != null ? (
                <Text style={styles.topSectionMainText}>
                  {formatCurrency(balance as number)}
                  <Text style={{ fontSize: 16 }}>$FLXA</Text>
                </Text>
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
            <Text style={{ fontSize: 16, fontFamily: globals.fontStyles.fontBold, paddingBottom: 0 }}>
              Select Operator
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
              {providerOptions.map((p) => {
                return (
                  <Pressable
                    onPress={() => setSelectedProvider(p.value)}
                    key={p.value}
                  >
                    <View
                      style={[
                        styles.optionItem,
                        { backgroundColor: selectedProvider == p.value ? "#DEDEDE" : globals.colors.neutral.white },
                      ]}
                    >
                      <Image
                        style={{ width: 70, height: 70, alignSelf: "center" }}
                        source={logoMap[p.label as Provider]}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontSize: 16, fontFamily: globals.fontStyles.fontBold, paddingBottom: 0 }}>
              Available Bonuses
            </Text>
            <View style={{ gap: 10 }}>
              {isLoadingBonus && (
                <View
                  style={{ backgroundColor: globals.colors.purple.secondary, minHeight: 100, borderRadius: 7 }}
                ></View>
              )}
              {isLoadingBonus && (
                <View
                  style={{ backgroundColor: globals.colors.purple.secondary, minHeight: 100, borderRadius: 7 }}
                ></View>
              )}
              {isLoadingBonus && (
                <View
                  style={{ backgroundColor: globals.colors.purple.secondary, minHeight: 100, borderRadius: 7 }}
                ></View>
              )}
              {bonuses &&
                !isLoadingBonus &&
                bonuses.map((b) => {
                  return (
                    <Pressable
                      onPress={() => {
                        console.log(b)
                        handleRedeem(b.id)
                      }}
                      key={b.title}
                      style={{
                        flexDirection: "column",
                        alignContent: "center",
                        justifyContent: "center",
                        // backgroundColor: "rgba(255,0,0,.5)",
                        minHeight: 100,
                        padding: 10,
                        borderWidth: 0.3,
                        borderColor: globals.colors.neutral.gray,
                        borderRadius: 7,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 18 }}>{b.title}</Text>
                        <Text style={{ fontFamily: globals.fontStyles.fontRegular, fontSize: 15, paddingBottom: 10 }}>
                          {b.description}
                        </Text>
                      </View>
                      <View style={{ alignContent: "flex-end", flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontFamily: globals.fontStyles.fontBold,
                            color: globals.colors.purple.primary,
                            width: "auto",
                            flex: 1,
                            textAlign: "right",
                          }}
                        >
                          <Text style={{ fontSize: 10 }}>$FLXA </Text>
                          {b.price}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
