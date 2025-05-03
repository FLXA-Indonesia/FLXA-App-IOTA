import globals from "@/assets/global-styles/gs";
import { RelativePathString, useRouter } from "expo-router";
import { useState } from "react";
import { ImageSourcePropType, View, Text, ScrollView, StyleSheet, Image, Pressable, FlatList } from "react-native";

export type Method = "mobile" | "bank" | "credit" | "wallet";

export interface TopUpOption {
  name: string;
  logo: ImageSourcePropType;
  method: Method;
  phoneNumber?: string;
}

interface Props {
  title: string;
  options: TopUpOption[];
}

const styles = StyleSheet.create({
  title: {
    fontFamily: globals.fontStyles.fontBold,
    fontSize: 16,
    paddingBottom: 12,
  },
  optionItem: {
    width: "30%",
    minHeight: 100,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.3,
    borderColor: globals.colors.neutral.gray,
    borderRadius: 7,
  },
  image: {
    width: 75,
    height: 75,
  },
});

export default function TopUpOptionsRow({ title = "Title", options }: Props) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <View style={{ gap: 14, flexWrap: "wrap", flexDirection: "row", justifyContent: "flex-start" }}>
        {options.map((option, index) => {
          return (
            <OptionItem
              key={String(option) + String(index)}
              option={option}
              method={option.method}
            />
          );
        })}
      </View>
    </View>
  );
}

function OptionItem({ option, method }: { option: TopUpOption; method: Method }) {
  const router = useRouter();

  const [touched, setTouched] = useState<boolean>(false);
  const methodToRouteMapping = {
    mobile: `/mobile-top-up?phoneNumber=${option.phoneNumber}&provider=${option.name}`,
    wallet: "/wallet-top-up",
    credit: "/credit-card-top-up",
    bank: `/bank-top-up?bank=${option.name}`,
  };

  const handleRouting = () => {
    router.push(methodToRouteMapping[method] as RelativePathString);
  };
  return (
    <Pressable
      onPress={handleRouting}
      onPressIn={() => setTouched(true)}
      onPressOut={() => setTouched(false)}
      style={[styles.optionItem, { backgroundColor: touched ? "#DEDEDE" : globals.colors.neutral.white }]}
    >
      <Image
        style={styles.image}
        source={option.logo}
      />
    </Pressable>
  );
}
