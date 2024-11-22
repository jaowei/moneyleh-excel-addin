import { insertText as insertTextInExcel } from "./excel";
/* global Office */
export async function insertText(text) {
    Office.onReady(async (info) => {
        switch (info.host) {
            case Office.HostType.Excel:
                await insertTextInExcel(text);
                break;
            default: {
                throw new Error("Don't know how to insert text when running in ${info.host}.");
            }
        }
    });
}
//# sourceMappingURL=taskpane.js.map