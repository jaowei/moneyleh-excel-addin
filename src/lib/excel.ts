/* global Excel console */

export async function insertRange(rangeData: string[][]) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const table = sheet.tables.getItemAt(0);
      table.rows.add(undefined, rangeData, true);
      // range.values = rangeData;
      // range.format.autofitColumns();
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}
