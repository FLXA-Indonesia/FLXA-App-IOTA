import globals from "@/assets/global-styles/gs";
import Button from "@/components/Button";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import { parse } from "@babel/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function OtpScreen() {
  const otpScreenStyles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.purple.primary,
      minHeight: "100%",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    text: {
      fontSize: 28,
      fontFamily: globals.fontStyles.fontBold,
      marginBottom: 29,
      color: globals.colors.neutral.white,
    },
  });

  const [otpCode, setOtpCode] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const [timer, setTimer] = useState<number>(10);
  const router = useRouter();
  const { type, phoneNumber, userId } = useLocalSearchParams<{ type: string; phoneNumber: string; userId: string }>();
  const isAddingCard = type == "add-card";
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChangeText = (newValue: string) => {
    if (newValue.length > 6) {
      return;
    }
    setOtpCode(newValue);
  };

  const checkFocus = (value: string, index: number): boolean => {
    if (index == 0) {
      return value[0] == undefined && value[1] == undefined;
    }
    return value[index] == undefined && value[index + 1] == undefined && value[index - 1] != undefined;
  };

  const handleResend = () => {
    if (isLoading || timer > 0) {
      return;
    }
    console.log(phoneNumber.replace(" ", ""));
    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + `/resend-otp?phoneNumber=${phoneNumber?.replace(" ", "")}`)
      .then(() => {
        setTimer(60);
        ToastAndroid.show("OTP Code Resent", 1000);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleVerify = async () => {
    if (otpCode.length != 6) {
      return ToastAndroid.show("OTP code must be 6 digits", 1000);
    }
    if (isAddingCard) {
      const addedPhoneNumber = await getLocalItem("addedPhoneNumber");
      const cleanedPhoneNumber = JSON.parse(addedPhoneNumber as string);
      const token = await getLocalItem("token");
      console.log(otpCode);
      setIsLoading(true);
      axios
        .post(
          process.env.EXPO_PUBLIC_FLXA_CARD_SERVICE + "/card/verify",
          {
            phoneNumber: cleanedPhoneNumber,
            otp: otpCode,
          },
          {
            headers: {
              authorization: `token ${token}`,
            },
          }
        )
        .then(() => {
          ToastAndroid.show("Card verified!", 1000);
          router.replace("/success?message=Card%20Added!");
        })
        .catch((err) => {
          console.log(err);
          ToastAndroid.show("Error verifying card", 1000);
        })
        .finally(() => setIsLoading(false))
    } else {
      const phoneNumberCleaned = phoneNumber.replace("+", "").replace(" ", "");
      setIsLoading(true);
      axios
        .get(
          process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE +
            `/verify-otp?phoneNumber=${phoneNumberCleaned}&userId=${userId}&otp=${otpCode}`
        )
        .then((res) => {
          AsyncStorage.setItem("token", res.data.session);
          // Call generate secret string endpoint
          axios
            .post(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + "/generate-secret", {
              userid: Number(userId),
              phoneNumber: phoneNumber.replace("+", "").replace(" ", ""),
            })
            .then(() => {
              ToastAndroid.show("Secret string sent to your phone number", 1000);
            })
            .catch((err: unknown) => {
              if (isAxiosError(err)) {
                return ToastAndroid.show(err.message, 1000);
              }
              ToastAndroid.show("Error generating secret string", 1000);
            });
          router.replace(`/auth/complete-profile?userId=${userId}`);
        })
        .catch((err) => {
          console.log(err);
          ToastAndroid.show("Invalid OTP", 1000);
        })
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });
    return () => {
      clearInterval(interval);
      backHandler.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={otpScreenStyles.main}>
          <Text style={otpScreenStyles.text}>Please check your SMS and enter 6 digits number below</Text>

          <View>
            <TextInput
              keyboardType="number-pad"
              style={{
                backgroundColor: "transparent",
                color: "transparent",
                position: "absolute",
                top: 0,
                width: "100%",
                height: 50,
                zIndex: 10,
              }}
              selectionColor={"transparent"}
              value={otpCode}
              onChangeText={handleChangeText}
              ref={inputRef}
            />

            <View
              style={{
                flexDirection: "row",
                marginBottom: 40,
                justifyContent: "space-between",
                // backgroundColor: "#FF0000",
              }}
            >
              <OtpBox
                value={otpCode[0]}
                focus={checkFocus(otpCode, 0)}
              />
              <OtpBox
                value={otpCode[1]}
                focus={checkFocus(otpCode, 1)}
              />
              <OtpBox
                value={otpCode[2]}
                focus={checkFocus(otpCode, 2)}
              />
              <OtpBox
                value={otpCode[3]}
                focus={checkFocus(otpCode, 3)}
              />
              <OtpBox
                value={otpCode[4]}
                focus={checkFocus(otpCode, 4)}
              />
              <OtpBox
                value={otpCode[5]}
                focus={checkFocus(otpCode, 5)}
              />
            </View>

            <View style={{ marginBottom: 100 }}>
              <Button
                onPress={handleVerify}
                type="secondary"
                disabled={isLoading}
              >
                <Text
                  style={{
                    fontFamily: globals.fontStyles.fontBold,
                    fontSize: 16,
                    color: globals.colors.purple.primary,
                  }}
                >
                  Verify
                </Text>
              </Button>
            </View>

            <View>
              <Text
                style={{ fontSize: 16, color: "#FFF", fontFamily: globals.fontStyles.fontRegular, textAlign: "center" }}
              >
                {timer > 0 && "Resend in "}
                {timer > 0 && (
                  <Text style={{ fontFamily: globals.fontStyles.fontBold }}>
                    {Math.floor(timer / 60) < 10 ? `0${Math.floor(timer / 60)}` : Math.floor(timer / 60)}:
                    {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                  </Text>
                )}
                {/* {timer == 0 && <Text style={{ fontFamily: globals.fontStyles.fontBold }}>00:00</Text>} */}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 0 || isLoading}
                style={{ opacity: timer > 0 || isLoading ? 0.5 : 1 }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: globals.fontStyles.fontBold,
                    color: "#fff",
                    fontSize: 18,
                    paddingVertical: 8,
                  }}
                >
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface Props {
  value: string;
  focus: boolean;
}
const OtpBox = ({ value, focus }: Props) => {
  const otpBoxStyles = StyleSheet.create({
    box: {
      width: 50,
      height: 50,
      backgroundColor: "#FFF",
      borderRadius: 7,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 24,
      color: globals.colors.neutral.black,
      textAlign: "center",
    },
  });

  return (
    <Pressable style={[otpBoxStyles.box, focus ? { backgroundColor: "#b48dfa" } : {}]}>
      <Text style={otpBoxStyles.text}>{value}</Text>
    </Pressable>
  );
};
