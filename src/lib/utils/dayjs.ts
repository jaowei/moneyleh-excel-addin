import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

export const DATE_FORMAT = "DD/MMM/YYYY";

dayjs.extend(customParseFormat);

export const extendedDayjs = dayjs;

export const formatTransactionDate = (target: string | undefined, targetFormat: string) => {
  const date = extendedDayjs(target, targetFormat);
  return date.isValid() ? date.format(DATE_FORMAT) : target;
};
