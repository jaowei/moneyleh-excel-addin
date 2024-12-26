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

export async function getColumnValues(columnName: string): Promise<string[][]> {
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

export async function registerExcelHandlers(eventCallback: (args: any) => Promise<any>) {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.onSelectionChanged.add(eventCallback);
  });
}

export async function getRangeValue(range: string): Promise<string[][]> {
  let data;
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    let targetRange = sheet.getRange(range).load("values");
    await context.sync();
    data = targetRange.values;
  });
  return data ?? [];
}

export async function setRangeValue(range: string, dataToSet: string[][]) {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    let targetRange = sheet.getRange(range).load("values");
    targetRange.values = dataToSet;
    await context.sync();
  });
}
