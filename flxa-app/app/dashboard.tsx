import globals from "@/assets/global-styles/gs";
import CardItem from "@/components/CardItem";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { Provider } from "@/constants/Providers";
import formatCurrency from "@/utilities/formatCurrency";
import { Colors } from "@/constants/Colors";

export type User = {
  name: string;
  email: string;
  id: number;
};

export type Card = {
  card_balance: number;
  card_phone_number: string;
  operator_name: Provider;
};

export default function DashboardScreen() {
  const styles = StyleSheet.create({
    main: {
      minHeight: "100%",
      backgroundColor: globals.colors.neutral.white,
    },
    topSection: {
      backgroundColor: globals.colors.purple.primary,
      paddingTop: 140,
      // paddingHorizontal: 16,
      paddingBottom: 25,
    },
    topSectionInfo: {
      backgroundColor: globals.colors.neutral.white,
      borderRadius: 14,
      width: "100%",
      zIndex: 1,
      paddingTop: 26,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    topSectionBG: {
      backgroundColor: "#FFE7E7",
      width: "100%",
      position: "absolute",
      bottom: 0,
      height: 100,
      borderTopRightRadius: 24,
      borderTopLeftRadius: 24,
      overflow: "hidden",
      zIndex: 0,
    },
    infoButton: {
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
    },
    secondSection: {
      paddingHorizontal: 16,
      paddingTop: 22,
    },
    secondSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
  });

  const [topUpTouched, setTopUpTouched] = useState<boolean>(false);
  const [addCardTouched, setAddCardTouched] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    id: 0,
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[] | null>(null);
  const router = useRouter();

  const handleHelp = () => {
    // Linking.openURL("https://wa.me/+6285179764717");
  };

  const handleTopUp = () => {
    router.push("/top-up");
  };

  const handleAddCard = () => {
    router.push("/add-card");
  };

  const handleManage = () => {
    router.push("/manage-card");
  };

  const getBalance = async () => {
    const token = await getLocalItem("token");
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);
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
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/amount/" + parsedUser.id, {
        headers: {
          authorization: `token ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setTokenBalance(Number(res.data.data.amount));
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
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_TOKEN_SERVICE + "/token/amount/" + parsedUser.id, {
        headers: {
          authorization: `token ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setTokenBalance(Number(res.data.data.amount));
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

  const getCards = async () => {
    const token = await getLocalItem("token");
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_CARD_SERVICE + `/card/view?userId=${parsedUser.id}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      .then((res) => {
        setCards(res.data ? res.data : []);
        AsyncStorage.setItem("cards", JSON.stringify(res.data));
      })
      .catch((err) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.response != undefined;
          if (serverResponded) {
            console.log(err.response);
            return ToastAndroid.show("Server responded with error", 1000);
          }
          if (noResponse) {
            return ToastAndroid.show("Connection or network error", 1000);
          }
          return ToastAndroid.show(err.message, 1000);
        }
      });
  };

  useEffect(() => {
    AsyncStorage.getItem("user", (err, res) => {
      if (typeof res === "string") {
        const parsed = JSON.parse(res);
        setUser(parsed);
      }
    });
    getBalance();
    getCards();
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user", (err, res) => {
        if (typeof res === "string") {
          const parsed = JSON.parse(res);
          setUser(parsed);
        }
      });
      getBalance();
      getCards();
    }, [])
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.main}>
          <View style={styles.topSection}>
            <TouchableOpacity
              onPress={handleHelp}
              style={{ position: "absolute", top: 8, right: 8, padding: 20 }}
            >
              <Image
                style={{ width: 30, height: 30 }}
                source={require("@/assets/images/HelpIconWhite.png")}
              />
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 16, width: "100%" }}>
              <View style={styles.topSectionInfo}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 16, fontFamily: globals.fontStyles.fontRegular, paddingBottom: 20 }}>
                    Hi, <Text style={{ fontFamily: globals.fontStyles.fontBold }}>{user.name}</Text>
                  </Text>
                  {tokenBalance != null ? (
                    <TouchableOpacity onPress={() => router.push("/bonus")}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: globals.fontStyles.fontRegular,
                        color: globals.colors.purple.primary,
                      }}
                    >
                      <Text style={{ fontFamily: globals.fontStyles.fontBold }}>
                        <Text style={{ fontSize: 25 }}>{tokenBalance}</Text>$FLXA
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  ) : <View style={{backgroundColor: globals.colors.purple.secondary, height: 40, width: 100, borderRadius: 7}}></View>}
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  {balance != null ? (
                    <View style={{ flexBasis: "auto" }}>
                      <Text style={{ fontSize: 12, fontFamily: globals.fontStyles.fontRegular }}>Current Balance</Text>
                      <Text
                        style={{
                          fontSize: 32,
                          fontFamily: globals.fontStyles.fontBold,
                          color: globals.colors.purple.primary,
                          height: 40,
                        }}
                      >
                        Rp{formatCurrency(balance)}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <View
                        style={{
                          width: 150,
                          height: 55,
                          borderRadius: 7,
                          backgroundColor: globals.colors.purple.secondary,
                        }}
                      />
                    </View>
                  )}

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      onPress={handleTopUp}
                      onPressIn={() => setTopUpTouched(true)}
                      onPressOut={() => setTopUpTouched(false)}
                      style={[
                        styles.infoButton,
                        { backgroundColor: topUpTouched ? "#5514C8" : globals.colors.purple.primary, borderRadius: 10 },
                      ]}
                    >
                      <Image
                        source={require("@/assets/images/TopUpIcon.png")}
                        style={{ width: 24, height: 24 }}
                      />
                      <Text
                        style={{
                          fontFamily: globals.fontStyles.fontBold,
                          color: globals.colors.neutral.white,
                          fontSize: 8,
                        }}
                      >
                        Top Up
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddCard}
                      onPressIn={() => setAddCardTouched(true)}
                      onPressOut={() => setAddCardTouched(false)}
                      style={[
                        styles.infoButton,
                        {
                          backgroundColor: addCardTouched ? "#BCB7F1" : globals.colors.purple.secondary,
                          borderRadius: 10,
                        },
                      ]}
                    >
                      <Image
                        source={require("@/assets/images/AddCardIcon.png")}
                        style={{ width: 24, height: 24 }}
                      />
                      <Text
                        style={{
                          fontFamily: globals.fontStyles.fontBold,
                          color: globals.colors.purple.primary,
                          fontSize: 8,
                        }}
                      >
                        Add Card
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.topSectionBG}>
              <Image source={require("@/assets/images/PinkGradient.png")} />
            </View>
          </View>

          <View style={styles.secondSection}>
            <View style={styles.secondSectionHeader}>
              <Text
                style={{
                  flexBasis: "auto",
                  fontFamily: globals.fontStyles.fontBold,
                  fontSize: 16,
                }}
              >
                My Cards
              </Text>
              <TouchableOpacity
                onPress={handleManage}
                style={{ flexBasis: "auto" }}
              >
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    color: globals.colors.purple.primary,
                    fontSize: 14,
                    flexBasis: "auto",
                    paddingVertical: 5,
                  }}
                >
                  Manage
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginTop: 12, paddingBottom: 40 }}>
              {cards == null ? (
                <View>
                  <View style={{ gap: 18 }}>
                    <View
                      style={{
                        width: "100%",
                        height: 105,
                        borderRadius: 7,
                        backgroundColor: globals.colors.purple.secondary,
                      }}
                    />
                    <View
                      style={{
                        width: "100%",
                        height: 105,
                        borderRadius: 7,
                        backgroundColor: globals.colors.purple.secondary,
                      }}
                    />
                    <View
                      style={{
                        width: "100%",
                        height: 105,
                        borderRadius: 7,
                        backgroundColor: globals.colors.purple.secondary,
                      }}
                    />
                    <View
                      style={{
                        width: "100%",
                        height: 105,
                        borderRadius: 7,
                        backgroundColor: globals.colors.purple.secondary,
                      }}
                    />
                  </View>
                </View>
              ) : (
                cards.map((c) => {
                  return (
                    <CardItem
                      key={c.card_phone_number}
                      balance={Math.floor(Number(c.card_balance))}
                      provider={c.operator_name}
                      phoneNumber={c.card_phone_number}
                    />
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
