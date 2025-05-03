import globals from "@/assets/global-styles/gs";
import formatCurrency from "@/utilities/formatCurrency";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import type { Provider } from "@/constants/Providers";
import { providerLogoMapping } from "@/constants/Providers";

interface Props {
  value: number;
  date: Date;
  type: "IN" | "OUT";
  method: string;
  status: string;
}

export default function HistoryItem({ value, date = new Date(), type, method, status }: Props) {
  if (status == "pending") {
    return;
  }
  const styles = StyleSheet.create({
    main: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    eventText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 15,
    },
    dateText: {
      fontFamily: globals.fontStyles.fontRegular,
      fontSize: 12,
    },
    valueText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 15,
      color: globals.colors.purple.primary,
    },
  });

  const images = {
    arrowDown: require("@/assets/images/ArrowDown.png"),
    telkomselLogo: require("@/assets/images/TselLogo.png"),
  };

  let provider = "";
  let event = "";
  const isSpending = type == "OUT";
  const isUsingMobileCredit = method == "MOBILE_CREDIT";
  if (isUsingMobileCredit) {
    provider = status as Provider;
  }
  if (method === "QRIS") {
    event = "QRIS Top Up";
  }
  if (method.includes("BANK")) {
    const bankName = method.split(" - ")[1];
    event = "Bank Transfer - " + bankName;
  }
  if (method.includes("CARD")) {
    event = "Credit Card Top Up";
  }
  if (isUsingMobileCredit) {
    event = "Mobile Credit Top Up";
  }
  if (isUsingMobileCredit && isSpending) {
    event = "Paid to " + status;
  }

  return (
    <View style={styles.main}>
      <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
        <View style={{ position: "relative" }}>
          <Image
            style={{ width: 40, height: 40, transform: [{ rotate: isSpending ? "180deg" : "0deg" }] }}
            source={images.arrowDown}
          />
          {isUsingMobileCredit && (
            <Image
              style={{ position: "absolute", width: 30, height: 30, bottom: "-30%", right: "-30%" }}
              source={providerLogoMapping[provider as Provider] as ImageSourcePropType}
            />
          )}
        </View>

        <View>
          <Text style={styles.eventText}>{event}</Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>
      </View>

      <View>
        <Text
          style={[
            styles.valueText,
            { color: isSpending ? globals.colors.neutral.black : globals.colors.purple.primary },
          ]}
        >
          {isSpending ? "-" : "+"}Rp{formatCurrency(Math.abs(value))}
        </Text>
      </View>
    </View>
  );
}

function formatDate(date: Date): string {
  const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${day} ${monthMap[month]} ${year} at ${hour}:${minute}`;
}
