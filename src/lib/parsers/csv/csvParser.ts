import Papa from "papaparse";
import { StatementFormats } from "../formats";
import { isDBSAccountFormat, parseDBSAppFormat, parseDBSNAVAppFormat } from "./formats/dbs";
import { isHSBCCard, parseHSBCFormat } from "./formats/hsbc";
import { isCitiCardFormat, parseCitiCardFormat } from "./formats/citi";
import { CSVFormatParser } from "../parser.types";

export const CSVFileParser = {
  async decodeFile(file: File) {
    const textContent = await file.text();
    return await this.extractContent(textContent);
  },
  async extractContent(textContent: string) {
    return Papa.parse(textContent, { skipEmptyLines: true });
  },
  async determineParser(data: Papa.ParseResult<any>) {
    if (isDBSAccountFormat(data)) {
      return this.appParsers[StatementFormats.DBS_ACCOUNT];
    }
    if (isHSBCCard(data)) {
      return this.appParsers[StatementFormats.HSBC_CARD];
    }
    if (isCitiCardFormat(data)) {
      return this.appParsers[StatementFormats.CITI_CARD];
    }
    return;
  },
  async safeParseContent(data: Papa.ParseResult<any>, accountName: string, companyName: string) {
    try {
      const parser = await this.determineParser(data);
      return parser?.(data, accountName, companyName);
    } catch (error) {
      return null;
    }
  },
  appParsers: {
    [StatementFormats.DBS_ACCOUNT]: parseDBSAppFormat,
    [StatementFormats.DBS_NAV_ACCOUNT]: parseDBSNAVAppFormat,
    [StatementFormats.HSBC_CARD]: parseHSBCFormat,
    [StatementFormats.CITI_CARD]: parseCitiCardFormat,
  } as Record<string, CSVFormatParser>,
};
