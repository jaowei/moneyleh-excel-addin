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

export async function getColumnValues(columnName: string) {
  let data;
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const table = sheet.tables.getItemAt(0);
      const companyRange = table.columns.getItem(columnName).getDataBodyRange().load("values");
      await context.sync();
      data = companyRange.values;
    });
    return data ?? [];
  } catch (error) {
    console.log("Error getting column data for", columnName, error);
    return [];
  }
}
