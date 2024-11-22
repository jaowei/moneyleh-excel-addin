import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import updateLocale from "dayjs/plugin/updateLocale";

export const DATE_FORMAT = "DD/MM/YYYY";

dayjs.extend(customParseFormat);
dayjs.extend(updateLocale);

const upperCaseMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const lowerCaseMonths = upperCaseMonths.map((mth) => mth[0] + mth.slice(1).toLowerCase());

dayjs.updateLocale("en", {
  monthsShort: [...upperCaseMonths, ...lowerCaseMonths],
});

export const extendedDayjs = dayjs;

export const formatTransactionDate = (target: string | undefined, targetFormat: string) => {
  const date = extendedDayjs(target, targetFormat);
  return date.isValid() ? date.format(DATE_FORMAT) : target;
};
