export type Provider = "Telkomsel" | "Indosat" | "XL Axiata" | "tri" | "vodafone";

export const providerNameMapping = {
  Telkomsel: "Telkomsel",
  Indosat: "Indosat Ooredoo",
  "XL Axiata": "XL Axiata",
  tri: "Tri",
  vodafone: "Vodafone",
};

export const providerLogoMapping = {
  Telkomsel: require("@/assets/images/TselLogo.png"),
  Indosat: require("@/assets/images/IndosatLogo.png"),
  "XL Axiata": require("@/assets/images/XlLogo.png"),
  tri: require("@/assets/images/TriLogo.png"),
  vodafone: require("@/assets/images/VodafoneLogo.png"),
};
