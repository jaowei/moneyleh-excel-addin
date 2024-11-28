import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "../pdf.worker.min.mjs";

import { StatementFormats } from "../formats";
import { isDBSCardFormat, parseDBSFormat } from "./formats/dbs";
import { isMooMooFormat, parseMoomooFormat } from "./formats/moomoo";
import { isTextItem, PDFFormatParser, Transaction } from "../parser.types";
import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import { isChocolateFormat, parseChocolateFormat } from "./formats/chocolate";
import { isCPFFormat, parseCPFFormat } from "./formats/cpf";

export const PDFFileParser = {
  async decodeFile(file: File, password?: string) {
    const fileUrl = URL.createObjectURL(file);
    const loadingTask = pdfjsLib.getDocument({ url: fileUrl, password });
    const doc = await loadingTask.promise;
    return await this.extractContent(doc);
  },
  async extractContent(doc: pdfjsLib.PDFDocumentProxy, sort = false) {
    const result = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const pageTextContent = await page.getTextContent();
      if (sort) {
        pageTextContent.items.sort((a, b) => {
          if (!isTextItem(a) || !isTextItem(b)) return 0;
          return b.transform[5] - a.transform[5];
        });
      }
      result.push(...pageTextContent.items);
    }
    return result;
  },
  async determineParser(data: Array<TextItem | TextMarkedContent>) {
    if (isDBSCardFormat(data)) {
      return this.appParsers[StatementFormats.DBS_CARD];
    }
    if (isMooMooFormat(data)) {
      return this.appParsers[StatementFormats.MOOMOO_ACCOUNT];
    }
    if (isChocolateFormat(data)) {
      return this.appParsers[StatementFormats.CHOCOLATE_ACCOUNT];
    }
    if (isCPFFormat(data)) {
      return this.appParsers[StatementFormats.CPF];
    }
    return;
  },
  async safeParseContent(data: Array<TextItem | TextMarkedContent>, accountName: string, companyName: string) {
    try {
      const parser = await this.determineParser(data);
      return parser?.(data, accountName, companyName);
    } catch (error) {
      return null;
    }
  },
  appParsers: {
    [StatementFormats.DBS_CARD]: parseDBSFormat,
    [StatementFormats.MOOMOO_ACCOUNT]: parseMoomooFormat,
    [StatementFormats.CHOCOLATE_ACCOUNT]: parseChocolateFormat,
    [StatementFormats.CPF]: parseCPFFormat,
  } as Record<string, PDFFormatParser>,
};

export const isInSameRow = (prevCoord: number, currentCoord: number, diff = 12): boolean => {
  return Math.abs(currentCoord - prevCoord) <= diff;
};

export const genericPDFDataExtractor = (
  data: Array<TextItem | TextMarkedContent>,
  accountName: string,
  companyName: string,
  filterRule: (text: string) => boolean,
  yearExtractor: (text: string) => string,
  startRule: (text: string) => boolean,
  stopRule: (text: string) => boolean,
  formatRow: (row: string[], year: string, accountName: string, companyName: string) => Transaction | Transaction[],
  shouldFormatRow: (row: string[]) => boolean
) => {
  if (!data) return [];
  let statementYear: string = "";
  let headerCoord = 0;
  let prevIdx: number = 0;
  let row: Array<string> = [];
  let result: Array<Transaction> = [];

  for (let i = 0; i < data.length; i++) {
    const prevItem = data[prevIdx];
    const currItem = data[i];
    if (!isTextItem(currItem) || !isTextItem(prevItem)) continue;
    const text = currItem.str;

    if (filterRule(text)) continue;

    if (!statementYear) statementYear = yearExtractor(text);

    if (startRule(text)) {
      headerCoord = currItem.transform[5];
    }

    // stops below code from running until header is found
    if (headerCoord === 0) continue;

    // Stop processing
    if (stopRule(text)) break;

    const prevCoord = prevItem.transform[5];
    const currCoord = currItem.transform[5];

    // is in same row
    if (isInSameRow(prevCoord, currCoord)) {
      row.push(text);
    } else {
      if (shouldFormatRow(row)) {
        const parsedData = formatRow(row, statementYear, accountName, companyName);
        if (Array.isArray(parsedData)) {
          result.push(...parsedData);
        } else {
          result.push(parsedData);
        }
      }
      row = [text];
    }

    prevIdx = i;
  }
  return result;
};
