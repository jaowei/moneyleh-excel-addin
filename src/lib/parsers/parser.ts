import { CSVFileParser } from "./csv/csvParser";
import { PDFFileParser } from "./pdf/pdfParser";
import { XlsFileParser } from "./xls/xlsParser";

export enum AcceptedMIMETypesEnum {
  PDF = "application/pdf",
  CSV = "text/csv",
  XLS = "application/vnd.ms-excel",
}

export const routeToParsers = async (
  file: File | undefined,
  accountName: string,
  companyName: string,
  password?: string
) => {
  let rowData;
  switch (file?.type) {
    case AcceptedMIMETypesEnum.PDF:
      const fileDataPDF = await PDFFileParser.decodeFile(file, password);
      rowData = await PDFFileParser.safeParseContent(fileDataPDF, accountName, companyName);
      break;
    case AcceptedMIMETypesEnum.CSV:
      const fileDataCSV = await CSVFileParser.decodeFile(file);
      rowData = await CSVFileParser.safeParseContent(fileDataCSV, accountName, companyName);
      break;
    case AcceptedMIMETypesEnum.XLS:
      const fileDataXLS = await XlsFileParser.decodeFile(file);
      rowData = await XlsFileParser.safeParseContent(fileDataXLS, accountName, companyName);
      break;
    default:
      break;
  }
  return rowData;
};
