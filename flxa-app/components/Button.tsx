import globals from "@/assets/global-styles/gs";
import { ReactNode, useState } from "react";
import { Pressable, ViewStyle, StyleSheet } from "react-native";

interface Props {
  style?: ViewStyle;
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
  type: "primary" | "secondary";
}

const buttonStyles = StyleSheet.create({
  general: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 5,
  },
  primary: {
    backgroundColor: globals.colors.purple.primary,
  },
  secondary: {
    backgroundColor: globals.colors.purple.secondary,
    borderColor: globals.colors.purple.primary,
    borderWidth: 1,
  },
  disabled: {
    opacity: .5,
  }
});

const buttonPressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: "#5514C8",
  },
  secondary: {
    backgroundColor: "#BCB7F1",
    borderColor: globals.colors.purple.primary,
    borderWidth: 1,
  },
});

export const buttonTextStyles = StyleSheet.create({
  primary: {
    color: "#FFF",
    fontFamily: globals.fontStyles.fontBold,
  },
  secondary: {
    color: globals.colors.purple.primary,
    fontFamily: globals.fontStyles.fontBold,
  },
});

export default function Button({ style, onPress = () => {}, disabled = false, children, type = "primary" }: Props) {
  const [pressed, setPressed] = useState<boolean>(false);

  return (
    <Pressable
      onPress={disabled ? () => {} : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[buttonStyles.general, pressed ? buttonPressedStyles[type] : buttonStyles[type], style, disabled ? buttonStyles.disabled : {}]}
    >
      {children}
    </Pressable>
  );
}
