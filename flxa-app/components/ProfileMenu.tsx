import globals from "@/assets/global-styles/gs";
import { useState } from "react";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  onPress: () => void,
  icon: ImageSourcePropType,
  mainText: string,
  subText: string
}



export default function ProfileMenu({onPress, icon = require("@/assets/images/ProfileIcon.png"), mainText, subText}: Props) {
  const styles = StyleSheet.create({
    menuMain: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      borderBottomColor: globals.colors.neutral.gray,
      borderBottomWidth: 0.75,
      paddingTop: 24,
      paddingBottom: 10,
      paddingHorizontal: 8,
      alignItems: "center",
    },
    menuMainTouched: {
      backgroundColor: "#DEDEDE",
    },
    menuMainText: {
      fontFamily: globals.fontStyles.fontBold,
      fontSize: 17,
      color: globals.colors.neutral.black
    },
    menuSubText: {
      fontFamily: globals.fontStyles.fontRegular,
      fontSize: 12,
      color: globals.colors.neutral.black
    },
    menuIcon: {
      width: 33,
      height: 33,
    },
    arrowIcon: {
      width: 13,
      height: 28,
    },
  });

  const [touched, setTouched] = useState(false);

  return (
    <Pressable
      onPressIn={() => {
        setTouched(true);
      }}
      onPressOut={() => {
        setTouched(false);
      }}
      onPress={onPress}
      style={[styles.menuMain, touched && styles.menuMainTouched]}
    >
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <Image
          source={icon}
          style={styles.menuIcon}
        />
        <View>
          <Text style={styles.menuMainText}>{mainText}</Text>
          <Text style={styles.menuSubText}>{subText}</Text>
        </View>
      </View>
      <Image
        source={require("@/assets/images/ArrowRight.png")}
        style={styles.arrowIcon}
      />
    </Pressable>
  );
}
