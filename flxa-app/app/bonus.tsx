import globals from "@/assets/global-styles/gs";
import type { Provider } from "@/constants/Providers";
import TopUpOptionsRow from "@/components/TopUpOptionsRow";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import formatCurrency from "@/utilities/formatCurrency";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus>({
    description: "",
    id: 0,
    price: 9999,
    title: "",
    type: "",
    valid_until: "",
  });
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
  function getSelectedProviderLabel(): string | undefined {
    const selected = providerOptions.find((provider) => provider.value === selectedProvider);
    return selected?.label;
  }
  const logoMap: Record<string, ImageSourcePropType> = {
    Telkomsel: require("@/assets/images/TselLogo.png"),
    Indosat: require("@/assets/images/IndosatLogo.png"),
    "XL Axiata": require("@/assets/images/XlLogo.png"),
  };

  function GetBonuses() {
    setIsLoadingBonus(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/bonus?operatorId=" + selectedProvider)
      .then((res) => {
        setBonuses(res.data.data);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsLoadingBonus(false);
      });
  }

  async function confirmRedeem(b: Bonus) {
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);
    const cards = await getLocalItem("cards");
    const parsedCards = JSON.parse(cards as string);

    if (b.price > Number(balance)) {
      ToastAndroid.show("Insufficient token", 1000);
      return;
    }

    setIsLoading(true)
    axios
      .post(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/redeem", {
        userId: parsedUser.id,
        bonusId: String(b.id),
        phone: parsedCards[0].card_phone_number,
      })
      .then((res) => {
        console.log(res);
        setBalance(Number(balance) - b.price)
        setIsModalOpen(false)
        router.replace("/success")
      })
      .catch((err) => {
        console.log(err.request);
        ToastAndroid.show("An error occurred", 1000);
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function onBonusPress(b: Bonus): void {
    console.log(b);
    setSelectedBonus(b);
    setIsModalOpen(true);
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
        <ScrollView contentContainerStyle={[styles.main, { height: isModalOpen ? "auto" : "auto" }]}>
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
                    <BonusItem
                      key={b.id}
                      bonus={b}
                      handlerCallback={() => onBonusPress(b)}
                    />
                  );
                })}
            </View>
          </View>
        </ScrollView>
        {isModalOpen && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View
              style={{
                padding: 20,
                backgroundColor: "#FFF",
                alignSelf: "center",
                width: "auto",
                borderRadius: 12,
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontFamily: globals.fontStyles.fontBold,
                  fontSize: 20,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Confirm Redemption
              </Text>

              <View
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    fontSize: 18,
                    marginBottom: 8,
                  }}
                >
                  {selectedBonus.title}
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontRegular,
                      color: "#666",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    PROVIDER
                  </Text>
                  <Text style={{ fontFamily: globals.fontStyles.fontRegular }}>{getSelectedProviderLabel()}</Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontRegular,
                      color: "#666",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    DESCRIPTION
                  </Text>
                  <Text style={{ fontFamily: globals.fontStyles.fontRegular }}>{selectedBonus.description}</Text>
                </View>

                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: "#ddd",
                    paddingTop: 12,
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontRegular,
                      color: "#666",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    COST
                  </Text>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontBold,
                      color: globals.colors.purple.primary,
                      fontSize: 24,
                    }}
                  >
                    {selectedBonus.price} $FLXA
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: globals.fontStyles.fontRegular,
                  color: "#FF0000",
                  textAlign: "center",
                  // color: "#666",
                  marginBottom: 20,
                }}
              >
                ⚠️ This action cannot be undone
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: "#f0f0f0",
                    borderRadius: 8,
                    alignItems: "center",
                    opacity: isLoading ? .5 : 1
                  }}
                  disabled={isLoading}
                >
                  <Text style={{ fontFamily: globals.fontStyles.fontRegular }}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={() => confirmRedeem(selectedBonus)}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: globals.colors.purple.primary,
                    borderRadius: 8,
                    alignItems: "center",
                    opacity: isLoading ? .5 : 1
                  }}
                  disabled={isLoading}
                >
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontBold,
                      color: "#FFF",
                    }}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function BonusItem({ bonus, handlerCallback }: { bonus: Bonus; handlerCallback: (b: Bonus) => void }) {
  const [touched, setTouched] = useState<boolean>(false);

  return (
    <Pressable
      onPressIn={() => setTouched(true)}
      onPressOut={() => setTouched(false)}
      onPress={() => handlerCallback(bonus)}
      key={bonus.title}
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
        backgroundColor: touched ? "#DEDEDE" : "#FFF",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 18 }}>{bonus.title}</Text>
        <Text style={{ fontFamily: globals.fontStyles.fontRegular, fontSize: 15, paddingBottom: 10 }}>
          {bonus.description}
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
          {bonus.price}
        </Text>
      </View>
    </Pressable>
  );
}
