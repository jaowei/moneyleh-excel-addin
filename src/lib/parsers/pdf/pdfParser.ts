import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "./pdf.worker.min.mjs?worker";

pdfjsLib.GlobalWorkerOptions.workerSrc = "../pdf.worker.min.mjs";

import { StatementFormats } from "../formats";
import { isDBSCardFormat, parseDBSFormat } from "./formats/dbs";
import { isMooMooFormat, parseMoomooFormat } from "./formats/moomoo";
import { isTextItem } from "../parser.types";
import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

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
  },
  async safeParseContent(data: Array<TextItem | TextMarkedContent>, accountName: string, companyName: string) {
    try {
      const parser = await this.determineParser(data);
      return parser(data, accountName, companyName);
    } catch (error) {
      return null;
    }
  },
  appParsers: {
    [StatementFormats.DBS_CARD]: parseDBSFormat,
    [StatementFormats.MOOMOO_ACCOUNT]: parseMoomooFormat,
  } as Record<string, any>,
};

export const isInSameRow = (prevCoord: number, currentCoord: number, diff = 12): boolean => {
  return Math.abs(currentCoord - prevCoord) <= diff;
};
