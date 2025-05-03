import globals from "@/assets/global-styles/gs";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import formatCurrency from "@/utilities/formatCurrency";
import { providerLogoMapping } from "@/constants/Providers";
import type { Provider }from "@/constants/Providers";

interface Props {
  provider: Provider;
  balance: number;
  phoneNumber: string;
}

export default function CardItem({ provider, phoneNumber, balance = 0 }: Props) {
  const styles = StyleSheet.create({
    main: {
      height: 100,
      borderWidth: 0.3,
      borderColor: globals.colors.neutral.gray,
      borderRadius: 7,
      padding: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    normal: {
      backgroundColor: globals.colors.neutral.white,
    },
    touched: {
      backgroundColor: "#DEDEDE",
    },
    phoneNumberText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 12,
      textAlign: "right",
    },
    balanceText: {
      fontFamily: globals.fontStyles.fontRegular,
      fontSize: 12,
      textAlign: "right",
    },
    balance: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 32,
      color: globals.colors.purple.primary,
      textAlign: "right",
    },
  });

  const [touched, setTouched] = useState<boolean>(false);

  const handlePress = () => {
    console.log("handle press");
  };

  return (
    <Pressable
      onPressIn={() => setTouched(true)}
      onPressOut={() => setTouched(false)}
      onPress={handlePress}
      style={[styles.main, touched ? styles.touched : styles.normal]}
    >
      <View style={{ flexBasis: "auto", justifyContent: "center", alignItems: "center", height: "100%" }}>
        {provider ? (
          <Image
            source={providerLogoMapping[provider]}
            style={{ width: 65, height: 65 }}
          />
        ) : (
          <View
            style={{ width: 65, height: 65, backgroundColor: globals.colors.purple.secondary, borderRadius: 120 }}
          />
        )}
      </View>
      <View>
        <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
        <Text style={styles.balanceText}>SIM Balance</Text>
        <Text style={styles.balance}>Rp{formatCurrency(balance)}</Text>
      </View>
    </Pressable>
  );
}
