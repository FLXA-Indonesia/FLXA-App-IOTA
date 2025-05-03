import globals from "@/assets/global-styles/gs";
import HistoryItem from "@/components/HistoryItem";
import { getLocalItem } from "@/utilities/asyncStorageHelper";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type Transaction = {
  transaction_id: number;
  transaction_type: "IN" | "OUT";
  transaction_status: string;
  transaction_amount: number;
  transaction_method: string;
  transaction_date: string;
};

export default function HistoryScreen() {
  const styles = StyleSheet.create({
    main: {
      backgroundColor: globals.colors.purple.primary,
      minHeight: "100%",
    },
    header: {
      paddingBottom: 8,
      paddingHorizontal: 16,
      paddingTop: 40,
    },
    headerText: {
      fontFamily: globals.fontStyles.fontBold,
      color: globals.colors.neutral.white,
      fontSize: 25,
    },
    mainSection: {
      backgroundColor: globals.colors.neutral.white,
      flex: 1,
      borderTopRightRadius: 23,
      borderTopLeftRadius: 23,
      paddingHorizontal: 23,
      paddingTop: 30,
      paddingBottom: 60,
      gap: 18,
    },
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getTransactions = async () => {
    const token = await getLocalItem("token");
    const user = await getLocalItem("user");
    const parsedUser = JSON.parse(user as string);

    setIsLoading(true);
    axios
      .get(process.env.EXPO_PUBLIC_FLXA_BALANCE_SERVICE + `/transaction/view?userId=${parsedUser.userId}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      .then((res) => {
        setTransactions(
          res.data.sort((a: Transaction, b: Transaction) => {
            const dateA = new Date(a.transaction_date).getTime();
            const dateB = new Date(b.transaction_date).getTime();
            return dateB - dateA;
          })
        );
      })
      .catch((err: unknown) => {
        if (isAxiosError(err)) {
          const serverResponded = err.response != undefined;
          const noResponse = err.request != undefined;
          if (serverResponded) {
            return console.log(err.response);
          }
          if (noResponse) {
            return console.log(err.request);
          }
          return console.log(err.message);
        }
        if (err instanceof Error) {
          console.log(err.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Balance History</Text>
          </View>

          <View style={styles.mainSection}>
            {isLoading ? (
              <View>
                <View style={{ gap: 18 }}>
                  <View
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 7,
                      backgroundColor: globals.colors.purple.secondary,
                    }}
                  />
                </View>
              </View>
            ) : (
              transactions.map((t) => {
                return (
                  <HistoryItem
                    status={t.transaction_status}
                    method={t.transaction_method}
                    key={t.transaction_id}
                    type={t.transaction_type}
                    date={new Date(t.transaction_date)}
                    value={t.transaction_amount}
                  />
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
