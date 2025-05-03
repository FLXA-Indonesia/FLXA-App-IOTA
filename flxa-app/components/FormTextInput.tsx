import globals from "@/assets/global-styles/gs";
import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";

type Type = "email" | "text" | "password" | "number";

interface Props {
  state: string;
  setState: Dispatch<SetStateAction<string>>;
  placeholder: string;
  type: Type;
  style?: object;
  onFocus?: () => void;
}

const textInputStyles = StyleSheet.create({
  wrapper: {},
  text: {
    fontFamily: globals.fontStyles.fontRegular,
    fontSize: 16,
    color: globals.colors.neutral.black,
    paddingBottom: 13,
  },
  line: {
    width: "100%",
    height: 2,
  },
  input: {
    fontFamily: globals.fontStyles.fontRegular,
  },
});

export default function FormTextInput({
  placeholder,
  state,
  setState,
  type = "text",
  style,
  onFocus = () => {},
}: Props) {
  const [focused, setFocused] = useState(false);
  const keyboardTypeMapping = {
    email: "email-address",
    text: "default",
    password: "default",
    number: "phone-pad",
  };

  return (
    <View style={textInputStyles.wrapper}>
      <TextInput
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => setFocused(false)}
        style={textInputStyles.text}
        placeholder={placeholder}
        placeholderTextColor={globals.colors.neutral.gray}
        secureTextEntry={type === "password"}
        value={state}
        onChangeText={(newText) => setState(newText)}
        keyboardType={keyboardTypeMapping[type] as KeyboardTypeOptions}
      />
      <View
        style={[
          textInputStyles.line,
          focused
            ? { backgroundColor: globals.colors.purple.primary }
            : { backgroundColor: globals.colors.neutral.gray },
        ]}
      />
    </View>
  );
}
