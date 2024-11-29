export async function insertRange(rangeData: (string | number)[][] | undefined) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const table = sheet.tables.getItemAt(0);
      table.rows.add(undefined, rangeData, true);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}
