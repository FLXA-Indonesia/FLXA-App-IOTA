import globals from "@/assets/global-styles/gs";
import Button, { buttonTextStyles } from "@/components/Button";
import FormTextInput from "@/components/FormTextInput";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import axios, { isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Provider } from "@/constants/Providers";
import { Dropdown } from "react-native-element-dropdown";

type DropdownOption = {
  value: Provider;
  label: Provider;
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: globals.colors.neutral.white,
    minHeight: "100%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 28,
    fontFamily: globals.fontStyles.fontBold,
    marginBottom: 60,
  },
  primaryButtonText: {
    ...buttonTextStyles.primary,
    fontSize: 16,
  },
  secondaryButtonText: {
    ...buttonTextStyles.secondary,
    fontSize: 16,
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
});

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const router = useRouter();
  const providerOptions: DropdownOption[] = [
    {
      label: "Indosat",
      value: "Indosat",
    },
    {
      label: "Telkomsel",
      value: "Telkomsel",
    },
    {
      label: "XL Axiata",
      value: "XL Axiata",
    },
  ];
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const submitHandler = () => {
    if (!name || name == "") {
      return ToastAndroid.show("Name is empty", 1000);
    }
    if (!phoneNumber || phoneNumber == "") {
      return ToastAndroid.show("Phone number is empty", 1000);
    }
    setIsLoading(true);
    axios
      .post(process.env.EXPO_PUBLIC_FLXA_AUTH_SERVICE + "/register", {
        name,
        phoneNumber,
        provider: selectedProvider
      })
      .then((res) => {
        AsyncStorage.setItem("user", JSON.stringify({ id: res.data.id, name: res.data.name }));
        ToastAndroid.show("Success, please verify", 1000);
        router.push(`/auth/otp?phoneNumber=${phoneNumber}&userId=${res.data.id}`);
      })
      .catch((err) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.request != undefined;
          if (serverResponded) {
            return ToastAndroid.show(err.response?.data.message, 1000);
          }
          if (noResponse) {
            return ToastAndroid.show("Connection or network error", 1000);
          }
        }
        ToastAndroid.show(err.message, 1000);
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <Text style={styles.text}>Hi, There! Please fill the form below to register</Text>

          <View style={{ gap: 24, marginBottom: 40 }}>
            <FormTextInput
              placeholder="Registered Phone Number"
              state={phoneNumber}
              setState={setPhoneNumber}
              type="number"
              onFocus={() => {
                setPhoneNumber((prev) => {
                  if (prev.startsWith("+62")) {
                    return prev;
                  }
                  return prev + "+62";
                });
              }}
            />
            <Dropdown
              data={providerOptions}
              value={selectedProvider}
              onChange={(item: DropdownOption) => {
                setSelectedProvider(item.value);
                setIsDropdownFocused(false);
              }}
              placeholder="Select Provider"
              onFocus={() => setIsDropdownFocused(true)}
              onBlur={() => setIsDropdownFocused(false)}
              labelField="label"
              valueField="value"
              style={[
                styles.dropdown,
                { borderColor: isDropdownFocused ? globals.colors.purple.primary : globals.colors.neutral.gray },
              ]}
              placeholderStyle={styles.dropdownPlaceholderStyle}
              selectedTextStyle={styles.dropdownSelectedStyle}
              itemTextStyle={styles.dropdownSelectedStyle}
            />
            <FormTextInput
              placeholder="Full Name"
              state={name}
              setState={setName}
              type="text"
            />
          </View>

          <View style={{ gap: 16, marginBottom: 80 }}>
            <Button
              onPress={submitHandler}
              type="primary"
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>Submit</Text>
            </Button>
          </View>

          <View style={{ justifyContent: "center" }}>
            <Text
              style={{
                color: globals.colors.neutral.gray,
                fontFamily: globals.fontStyles.fontRegular,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Already have a registered number?
            </Text>
            <Pressable
              style={{ paddingVertical: 5 }}
              onPress={() => {
                router.replace("/auth/login");
              }}
            >
              <Text
                style={{
                  color: globals.colors.purple.primary,
                  fontFamily: globals.fontStyles.fontRegular,
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Log In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
