import Papa from "papaparse";
import { StatementFormats } from "../formats";
import { isDBSAccountFormat, parseDBSAppFormat, parseDBSNAVAppFormat } from "./formats/dbs";
import { isHSBCCard, parseHSBCFormat } from "./formats/hsbc";
import { isCitiCardFormat, parseCitiCardFormat } from "./formats/citi";
import { CSVFormatParser } from "../parser.types";
import { isIBKRFormat, parseIBKRFormat } from "./formats/ibkr";

export const CSVFileParser = {
  async decodeFile(file: File) {
    const textContent = await file.text();
    return await this.extractContent(textContent);
  },
  async extractContent(textContent: string) {
    return Papa.parse(textContent, { skipEmptyLines: true });
  },
  async determineParser(
    data: Papa.ParseResult<any>
  ): Promise<[CSVFormatParser | undefined, StatementFormats | undefined]> {
    if (isDBSAccountFormat(data)) {
      return [this.appParsers[StatementFormats.DBS_ACCOUNT], StatementFormats.DBS_ACCOUNT];
    }
    if (isHSBCCard(data)) {
      return [this.appParsers[StatementFormats.HSBC_CARD], StatementFormats.HSBC_CARD];
    }
    if (isCitiCardFormat(data)) {
      return [this.appParsers[StatementFormats.CITI_CARD], StatementFormats.CITI_CARD];
    }
    if (isIBKRFormat(data)) {
      return [this.appParsers[StatementFormats.IBKR_ACCOUNT], StatementFormats.IBKR_ACCOUNT];
    }
    return [undefined, undefined];
  },
  async safeParseContent(data: Papa.ParseResult<any>, accountName: string, companyName: string) {
    try {
      const [parser, formatName] = await this.determineParser(data);
      return {
        rowData: parser?.(data, accountName, companyName),
        formatName,
      };
    } catch (error) {
      return null;
    }
  },
  appParsers: {
    [StatementFormats.DBS_ACCOUNT]: parseDBSAppFormat,
    [StatementFormats.DBS_NAV_ACCOUNT]: parseDBSNAVAppFormat,
    [StatementFormats.HSBC_CARD]: parseHSBCFormat,
    [StatementFormats.CITI_CARD]: parseCitiCardFormat,
    [StatementFormats.IBKR_ACCOUNT]: parseIBKRFormat,
  } as Record<string, CSVFormatParser>,
};
