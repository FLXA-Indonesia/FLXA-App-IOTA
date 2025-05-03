import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getLocalItem(key: string) {
  try {
    const item = await AsyncStorage.getItem(key)
    return item
  } catch (err: unknown) {
    return "error retrieving data"
  }
}

export async function setLocalItem(key:string, value:string) {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err)
    }
  }
}