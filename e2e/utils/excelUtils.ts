import type ExcelJS from "exceljs";

export function workbookToJsonArray(workbook: ExcelJS.Workbook) {
  const book: any[] = [];
  workbook.eachSheet((worksheet) => {
    const sheet: any[] = [];
    worksheet.eachRow((row, _rowNumber) => {
      const rowData: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell, _colNumber) => {
        rowData.push(cell.value); // Use `cell.value` to get the value of the cell
      });
      sheet.push(rowData); // Add the row data (array of cell values)
    });
    book.push(sheet);
  });
  return book;
}
