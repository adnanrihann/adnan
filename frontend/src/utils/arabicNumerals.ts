const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const toArabicNumerals = (value: number | string): string => {
  return String(value)
    .split("")
    .map((ch) => {
      const d = parseInt(ch, 10);
      return Number.isNaN(d) ? ch : arabicDigits[d];
    })
    .join("");
};
