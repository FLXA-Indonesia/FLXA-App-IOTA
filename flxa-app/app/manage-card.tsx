import globals from "@/assets/global-styles/gs";
import formatCurrency from "@/utilities/formatCurrency";
import { useRouter } from "expo-router";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  BackHandler,
  TouchableOpacity,
  ToastAndroid,
  Modal,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { providerLogoMapping, providerNameMapping } from "@/constants/Providers";
import type { Card } from "@/app/dashboard";
import type { Provider } from "@/constants/Providers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import Button, { buttonTextStyles } from "@/components/Button";

export default function ManageCardScreen() {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.purple.primary,
      minHeight: "100%",
    },
    mainSection: {
      backgroundColor: globals.colors.neutral.white,
      borderTopLeftRadius: 23,
      borderTopRightRadius: 23,
      flex: 1,
      paddingBottom: 60,
      paddingTop: 42,
      paddingHorizontal: 16,
      gap: 8,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(45,36,80,.6)",
      paddingHorizontal: 24,
    },
    modalView: {
      width: "100%",
      margin: 20,
      backgroundColor: globals.colors.neutral.white,
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    textStyle: {
      color: "white",
      fontFamily: globals.fontStyles.fontBold,
      textAlign: "center",
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center",
    },
  });

  const router = useRouter();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("cards", (err, cards) => {
      const parsedCards = JSON.parse(cards as string);
      setCards(parsedCards);
    });
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleAddCard = () => router.push("/add-card");

  const handleConfirmDelete = async () => {
    const token = await getLocalItem("token");
    if (phoneNumber.length < 10) {
      return ToastAndroid.show("invalid phone number", 1000);
    }
    setIsLoading(true);
    axios
      .delete(process.env.EXPO_PUBLIC_FLXA_CARD_SERVICE + `/card/delete`, {
        headers: {
          Authorization: `token ${token}`,
        },
        data: {
          phoneNumber: phoneNumber,
        },
      })
      .then(() => {
        ToastAndroid.show("Card deleted!", 1000);
        setIsModalVisible(false);
        router.replace("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        ToastAndroid.show("An error occured", 1000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setIsModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={{ fontFamily: globals.fontStyles.fontRegular, paddingBottom: 40, fontSize: 16 }}>
                  Are you sure you want to delete card{" "}
                  <Text style={{ fontFamily: globals.fontStyles.fontBold }}>{phoneNumber}</Text>?
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    disabled={isLoading}
                    type="primary"
                    onPress={handleConfirmDelete}
                    style={{ flex: 1, paddingVertical: 8 }}
                  >
                    <Text style={[buttonTextStyles.primary, { fontSize: 14 }]}>Delete</Text>
                  </Button>
                  <Button
                    disabled={isLoading}
                    type="secondary"
                    onPress={() => setIsModalVisible(false)}
                    style={{ flex: 1, paddingVertical: 8 }}
                  >
                    <Text style={[buttonTextStyles.secondary, { fontSize: 14 }]}>Cancel</Text>
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              paddingHorizontal: 14,
              paddingTop: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingBottom: 33,
              flexBasis: "auto",
              alignSelf: "flex-start",
            }}
          >
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/BackArrow.png")}
            />
            <Text
              style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 14, color: globals.colors.neutral.white }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <View style={styles.mainSection}>
            {cards == null ? ( 
              <View>
                <View style={{ gap: 8 }}>
                  <View
                    style={{
                      width: "100%",
                      height: 105,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 105,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 105,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                </View>
              </View>
            ) : (
              cards?.map((c) => {
                return (
                  <ManageCardItem
                    key={c.card_phone_number}
                    provider={c.operator_name as Provider}
                    phoneNumber={c.card_phone_number}
                    simBalance={c.card_balance}
                    modalState={isModalVisible}
                    setModalState={setIsModalVisible}
                    setPhoneNumber={setPhoneNumber}
                    deletable={cards.length > 1}
                  />
                );
              })
            )}
            {cards && (
              <TouchableOpacity
                onPress={handleAddCard}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 30,
                  borderRadius: 7,
                  borderWidth: 0.8,
                  borderColor: globals.colors.neutral.gray,
                  borderStyle: "dashed",
                }}
              >
                <Image
                  style={{ width: 51, height: 46 }}
                  source={require("@/assets/images/AddCardIconText.png")}
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface Props {
  provider: Provider;
  phoneNumber: string;
  simBalance: number;
  modalState: boolean;
  setModalState: Dispatch<SetStateAction<boolean>>;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  deletable: boolean;
}

function ManageCardItem({
  provider,
  phoneNumber,
  simBalance,
  modalState,
  setModalState,
  setPhoneNumber,
  deletable,
}: Props) {
  const handleDeleteCard = async () => {
    setPhoneNumber(phoneNumber);
    setModalState(true);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 0.3,
        borderColor: globals.colors.neutral.gray,
        alignItems: "center",
        paddingHorizontal: 10.5,
        paddingVertical: 14,
        borderRadius: 7,
      }}
    >
      <Image
        style={{ width: 65, height: 65 }}
        source={providerLogoMapping[provider as Provider]}
      />

      <View>
        <Text style={{ fontFamily: globals.fontStyles.fontBold, fontSize: 15 }}>
          {providerNameMapping[provider as Provider]}
        </Text>
        <Text style={{ fontFamily: globals.fontStyles.fontRegular, fontSize: 12 }}>{phoneNumber}</Text>
        <Text style={{ fontFamily: globals.fontStyles.fontRegular, fontSize: 12 }}>
          SIM Balance{" "}
          <Text style={{ fontFamily: globals.fontStyles.fontBold, color: globals.colors.purple.primary }}>
            Rp{formatCurrency(Math.floor(simBalance))}
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        onPress={deletable ? handleDeleteCard : () => {}}
        style={{ padding: 5, opacity: deletable ? 1 : 0.2 }}
      >
        <Image
          style={{ width: 18, height: 20 }}
          source={require("@/assets/images/DeleteIcon.png")}
        />
      </TouchableOpacity>
    </View>
  );
}
