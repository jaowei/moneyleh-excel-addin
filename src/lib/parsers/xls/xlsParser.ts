import { read, utils, WorkBook } from "xlsx";
import { isUOBCardFormat, parseUOBFormat } from "./formats/uob";
import { StatementFormats } from "../formats";

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
  async determineParser(data: Array<any>) {
    if (isUOBCardFormat(data)) {
      return this.appParsers[StatementFormats.UOB_CARD];
    }
  },
  async safeParseContent(data: Array<any>, accountName: string, companyName: string) {
    try {
      const parser = await this.determineParser(data);
      return parser(data, accountName, companyName);
    } catch (error) {
      return null;
    }
  },
  async getSheetNames(file: File) {
    const workbook = await this.readFile(file);
    return workbook.SheetNames;
  },
  appParsers: {
    [StatementFormats.UOB_CARD]: parseUOBFormat,
  } as Record<string, any>,
};
