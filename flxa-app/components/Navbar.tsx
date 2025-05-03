import globals from "@/assets/global-styles/gs";
import { Link, RelativePathString } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";

interface Props {
  pathname: string;
}

export default function Navbar({ pathname }: Props) {
  const icons = {
    home: {
      active: require("@/assets/images/HomeIconActive.png"),
      inactive: require("@/assets/images/HomeIconInactive.png"),
    },
    topup: {
      active: require("@/assets/images/TopUpIconActive.png"),
      inactive: require("@/assets/images/TopUpIconInactive.png"),
    },
    history: {
      active: require("@/assets/images/HistoryIconActive.png"),
      inactive: require("@/assets/images/HistoryIconInactive.png"),
    },
    profile: {
      active: require("@/assets/images/ProfileIconActive.png"),
      inactive: require("@/assets/images/ProfileIconInactive.png"),
    },
  };

  const styles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.neutral.white,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 16,
      borderTopLeftRadius: 23,
      borderTopRightRadius: 23,
    },
    menu: {
      padding: 16,
      flexBasis: "auto",
      alignSelf: "flex-start",
      borderRadius: 12,
    },
    activeMenu: {
      backgroundColor: globals.colors.purple.primary,
    },
    inactiveMenu: {
      backgroundColor: globals.colors.purple.secondary,
    },
    icon: {
      width: 24,
      height: 24,
    },
  });

  return (
    <Shadow
      startColor="rgba(0,0,0,.1)"
      distance={4}
      style={styles.main}
    >
      <Link
        href="/dashboard"
        style={[styles.menu, pathname == "/dashboard" ? styles.activeMenu : styles.inactiveMenu]}
      >
        <Image
          style={styles.icon}
          source={pathname == "/dashboard" ? icons["home"]["active"] : icons["home"]["inactive"]}
        />
      </Link>
      <Link
        href="/top-up"
        style={[styles.menu, pathname == "/top-up" ? styles.activeMenu : styles.inactiveMenu]}
      >
        <Image
          style={styles.icon}
          source={pathname == "/top-up" ? icons["topup"]["active"] : icons["topup"]["inactive"]}
        />
      </Link>
      <Link
        href="/history"
        style={[styles.menu, pathname == "/history" ? styles.activeMenu : styles.inactiveMenu]}
      >
        <Image
          style={styles.icon}
          source={pathname == "/history" ? icons["history"]["active"] : icons["history"]["inactive"]}
        />
      </Link>
      <Link
        href="/profile"
        style={[styles.menu, pathname == "/profile" ? styles.activeMenu : styles.inactiveMenu]}
      >
        <Image
          style={styles.icon}
          source={pathname == "/profile" ? icons["profile"]["active"] : icons["profile"]["inactive"]}
        />
      </Link>
    </Shadow>
  );
}
