export default function formatCurrency(value: number): string {
  let valStr = String(value);
  let result = "";

  const isNegative = value < 0
  if (isNegative) {
    valStr = valStr.replace("-", "")
  }
  
  const valLength = valStr.length;
  const divBy3Remainder = valStr.length % 3;

  if (valStr.length <= 3) return valStr;

  if (divBy3Remainder !== 0) {
    for (let i = 0; i < valLength; i++) {
      if (i >= divBy3Remainder && (i - divBy3Remainder ) % 3 == 0) {
        result += ".";
      }
      result += valStr[i];
    }
  } else {
    for (let i = 0; i < valLength; i++) {
      result += valStr[i];
      if ((i + 1) % 3 == 0 && i + 1 != valLength) {
        result += ".";
      }
    }
  }

  if(isNegative) {
    return `-${result}`
  }
  return result;
}
