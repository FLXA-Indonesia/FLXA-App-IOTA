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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import Button, { buttonTextStyles } from "@/components/Button";
import { WebView } from "react-native-webview";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import axios from "axios";

export default function CreditCardTopUpScreen() {
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
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expirationMonth, setExpirationMonth] = useState<string>("");
  const [expirationYear, setExpirationYear] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [cardHolderName, setCardHolderName] = useState<string>("");
  const yearInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const handleBack = () => {
    router.push("/top-up");
  };

  const handleContinue = () => {
    const dataToSend = {
      creditCardNumber,
      expirationMonth,
      expirationYear,
      cvv,
    };

    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(dataToSend));
    }
  };

  const handleCharge = async (ccToken: string) => {
    const token = await getLocalItem("token");
    console.log(ccToken);

    if (amount < 10000) {
      return ToastAndroid.show("Minimum top up amount is Rp10.000", 1000);
    }

    if (
      creditCardNumber.length < 16 ||
      expirationMonth.length < 2 ||
      expirationYear.length < 4 ||
      cvv.length < 3 ||
      cardHolderName.length < 1
    ) {
      return ToastAndroid.show("Please fill all the fields!", 1000);
    }

    setIsLoading(true);
    axios
      .post(
        process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + "/transaction/charge/credit-card",
        {
          amount,
          tokenId: ccToken,
        },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        ToastAndroid.show("Transaction success!", 1000);
        router.push("/success?message=Payment%20Success&route=top-up");
      })
      .catch((error) => {
        console.log(error);
        ToastAndroid.show("Failed to create transaction!", 1000);
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
              style={{
                fontFamily: globals.fontStyles.fontBold,
                fontSize: 14,
                color: globals.colors.neutral.white,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Top Up Using Credit Card</Text>

            <View style={{ justifyContent: "space-between", flex: 1 }}>
              <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontBold,
                      fontSize: 15,
                    }}
                  >
                    Top Up Amount
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: globals.fontStyles.fontBold,
                        fontSize: 16,
                        flexBasis: "auto",
                      }}
                    >
                      Rp
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={String(amount)}
                      onChangeText={(text) => setAmount(Number(text))}
                    />
                  </View>
                </View>

                <View style={{ gap: 12 }}>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontBold,
                      fontSize: 15,
                    }}
                  >
                    Card Number
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={creditCardNumber}
                    onChangeText={(text) => {
                      setCreditCardNumber(text);
                    }}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ gap: 12, flex: 2 }}>
                    <Text
                      style={{
                        fontFamily: globals.fontStyles.fontBold,
                        fontSize: 15,
                      }}
                    >
                      Expiration Date
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        keyboardType="number-pad"
                        value={expirationMonth}
                        onChangeText={(text) => {
                          const month = Number(text);
                          const isTyping = text.length > expirationMonth.length;
                          if (isTyping) {
                            if (text.length > 2) {
                              return yearInputRef.current?.focus();
                            }
                            if (month > 12) {
                              return setExpirationMonth("12");
                            }
                            if (month <= 0) {
                              return setExpirationMonth("01");
                            }
                            setExpirationMonth(text);
                          }
                          setExpirationMonth(text);
                        }}
                        placeholder="MM"
                      />
                      <TextInput
                        ref={yearInputRef}
                        style={[styles.input, { flex: 2 }]}
                        keyboardType="number-pad"
                        value={expirationYear}
                        onChangeText={(text) => {
                          const year = Number(text);
                          const currentYear = new Date().getFullYear();
                          const isTyping = text.length > expirationYear.length;
                          if (isTyping) {
                            if (text.length > 4) {
                              return;
                            }
                            if (year < currentYear && text.length >= 4) {
                              return setExpirationYear(String(currentYear));
                            }
                            setExpirationYear(text);
                          }
                          setExpirationYear(text);
                        }}
                        placeholder="YYYY"
                      />
                    </View>
                  </View>

                  <View style={{ gap: 12, flex: 1.5 }}>
                    <Text
                      style={{
                        fontFamily: globals.fontStyles.fontBold,
                        fontSize: 15,
                      }}
                    >
                      CVV
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={cvv}
                      onChangeText={(text) => {
                        setCvv(text);
                      }}
                      placeholder="XXXX"
                    />
                  </View>
                </View>

                <View style={{ gap: 12, flex: 1, paddingBottom: 20 }}>
                  <Text
                    style={{
                      fontFamily: globals.fontStyles.fontBold,
                      fontSize: 15,
                    }}
                  >
                    Card Holder Name
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="default"
                    value={cardHolderName}
                    onChangeText={(text) => {
                      setCardHolderName(text);
                    }}
                    placeholder="John Doe"
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

              <WebView
                style={{ display: "none" }}
                ref={webViewRef}
                source={{
                  html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <title>Midtrans Card Token Example</title>
                          <script
                            id="midtrans-script"
                            src="https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js"
                            data-environment="sandbox"
                            data-client-key="SB-Mid-client-kOiwqGLjrIUUZnEn"
                            type="text/javascript"
                          ></script>
                        </head>
                        <body>
                          <div id="result" style="margin-top: 20px; font-size: 16px;"></div>
                          <script>
                            document.addEventListener("message", function (event) {
                              try {
                                const cardData = {
                                  card_number:4811111111111114,
                                  card_exp_month:12,
                                  card_exp_year:2028,
                                  card_cvv:123,
                                };

                                MidtransNew3ds.getCardToken(cardData, {
                                  onSuccess: function (response) {
                                    const successData = {
                                      status: "success",
                                      token: response.token_id,
                                      message: "Card token generated successfully!",
                                    };
                                    window.ReactNativeWebView.postMessage(JSON.stringify(successData));
                                  },
                              
                                  onFailure: function (response) {
                                    const errorData = {
                                      cardData,
                                      status: "error",
                                      errorMessage: response.status_message,
                                    };
                                    window.ReactNativeWebView.postMessage(JSON.stringify(errorData));
                                  },
                                });
                              } catch (error) {
                                const errorData = {
                                  status: "error",
                                  errorMessage: "An error occurred while generating card token!",
                                };
                                window.ReactNativeWebView.postMessage(JSON.stringify(errorData));
                              }
                            });
                          </script>
                        </body>
                      </html>
                    `,
                }}
                onMessage={(event) => {
                  const response = JSON.parse(event.nativeEvent.data);
                  if (response.status === "success") {
                    handleCharge(response.token);
                  } else {
                    ToastAndroid.show("Error occurred!", 1000);
                  }
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
