import { read, utils, WorkBook } from "xlsx";
import { isUOBAccountFormat, isUOBCardFormat, parseUOBAccountFormat, parseUOBCardFormat } from "./formats/uob";
import { StatementFormats } from "../formats";
import { XLSFormatParser } from "../parser.types";

export const XlsFileParser = {
  async readFile(file: File) {
    return read(await file.arrayBuffer(), { cellDates: true });
  },
  async decodeFile(file: File) {
    const workbook = await this.readFile(file);
    const numSheets = workbook.SheetNames.length;
    if (numSheets == 0) {
      throw new Error("no-sheets-detected");
    }
    return await this.extractContent(workbook);
  },
  async extractContent(workbook: WorkBook) {
    return utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
    });
  },
  async determineParser(data: Array<any>): Promise<[XLSFormatParser | undefined, StatementFormats | undefined]> {
    if (isUOBCardFormat(data)) {
      return [this.appParsers[StatementFormats.UOB_CARD], StatementFormats.UOB_CARD];
    }
    if (isUOBAccountFormat(data)) {
      return [this.appParsers[StatementFormats.UOB_ACCOUNT], StatementFormats.UOB_ACCOUNT];
    }
    return [undefined, undefined];
  },
  async safeParseContent(data: Array<any>, accountName: string, companyName: string) {
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
  async getSheetNames(file: File) {
    const workbook = await this.readFile(file);
    return workbook.SheetNames;
  },
  appParsers: {
    [StatementFormats.UOB_CARD]: parseUOBCardFormat,
    [StatementFormats.UOB_ACCOUNT]: parseUOBAccountFormat,
  } as Record<string, XLSFormatParser>,
};
