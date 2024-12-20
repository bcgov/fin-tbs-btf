import type ExcelJS from "exceljs";

export function workbookToJson(workbook: ExcelJS.Workbook) {
  const book: any[] = [];
  workbook.eachSheet((worksheet) => {
    const sheet: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData.push(cell.value); // Use `cell.value` to get the value of the cell
      });
      sheet.push(rowData); // Add the row data (array of cell values)
    });
    book.push(sheet);
  });
  return book;
}
