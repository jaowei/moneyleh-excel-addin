import { CSVFileParser } from "./csv/csvParser";

export enum AcceptedMIMETypesEnum {
  PDF = "application/pdf",
  CSV = "text/csv",
  XLS = "application/vnd.ms-excel",
}

export const routeToParsers = async (file: File | undefined, accountName: string, companyName: string) => {
  let rowData;
  switch (file?.type) {
    case AcceptedMIMETypesEnum.CSV:
      const fileDataCSV = await CSVFileParser.decodeFile(file);
      rowData = await CSVFileParser.safeParseContent(fileDataCSV, accountName, companyName);
      break;
    default:
      break;
  }
  return rowData;
};
