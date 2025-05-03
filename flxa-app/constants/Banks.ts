export type Bank = "BCA" | "BNI" | "Mandiri" | "BRI";

export const bankLogoMapping: Record<string, string> = {
  BNI: require("@/assets/images/BNILogo.png"),
  BCA: require("@/assets/images/BCALogo.png"),
  Mandiri: require("@/assets/images/MandiriLogo.png"),
  BRI: require("@/assets/images/BRILogo.png"),
};
