const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const latinDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function toPersianDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => persianDigits[Number(digit)]);
}

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^\d]/g, "");
}

export function normalizeRechargeCode(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

export function formatCredits(value: number) {
  return `${toPersianDigits(new Intl.NumberFormat("fa-IR").format(value))} اعتبار`;
}

export function codeLengthLabel(length: 5 | 6) {
  return `${toPersianDigits(length)} رقمی`;
}

export { latinDigits };
