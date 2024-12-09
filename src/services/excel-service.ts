import { DateTimeFormatter, LocalDate, LocalDateTime } from "@js-joda/core";
import ExcelJS from "exceljs";
import { FieldMetadata } from "../constants";
import { saveAs } from "file-saver";
import { Locale } from "@js-joda/locale_en";

const excelService = {
  /**
   * Function to export extracted form data to an Excel file.
   * This will be presented as a download to the user.
   * @param inputRows - The array of extracted form data. Each element is an object representing a row of data.
   * @param fieldMetadata - The order of columns to be used in the Excel file
   */
  async exportToExcel(
    inputRows: Record<string, string>[],
    fieldMetadata: FieldMetadata[],
    auditData: Record<string, string>,
  ) {
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("DATA");

      const sheetColumnMeta: typeof worksheet.columns = fieldMetadata.map(
        (x) => ({
          header: x.name,
          width: x.name.length * 1.25, // make slightly larger because headers are in all caps
          style: x.type == "date" ? { numFmt: "d-mmm-yy" } : {},
        }),
      );

      // Turn each row from the input into an array for output using the order of the fieldMetadata
      const formattedData = inputRows.map((input) => {
        return fieldMetadata.map((column, i) => {
          // adjust width depending on content
          sheetColumnMeta[i].width = Math.max(
            sheetColumnMeta[i].width ?? 10,
            input[column.name]?.length ?? 0,
          );
          // change the type(string/number/date) to the correct one
          if (column.overrideValue != null) return column.overrideValue;
          else if (column.type == "number")
            return Number.parseInt(input[column.name]);
          else if (column.type == "date") {
            const date = LocalDate.parse(
              input[column.name],
              DateTimeFormatter.ofPattern("dd'-'MMM'-'yy").withLocale(
                Locale.US,
              ),
            ).format(DateTimeFormatter.ISO_LOCAL_DATE);
            return new Date(date);
          } else return input[column.name];
        });
      });

      worksheet.columns = sheetColumnMeta;

      // Add data rows and apply alignment
      formattedData.forEach((rowData) => {
        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colIndex) => {
          cell.alignment = { horizontal: fieldMetadata[colIndex - 1].align };
        });
      });

      // Audit sheet
      const auditWorksheet = workbook.addWorksheet("METADATA");
      auditWorksheet.addRow(["Label", "Value"]);
      Object.entries(auditData).forEach(([key, value]) =>
        auditWorksheet.addRow([key, value]),
      );
      auditWorksheet.columns = [{ width: 15 }, { width: 25 }];

      // Download the Excel file
      const dateTime = LocalDateTime.now().format(
        DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"),
      );
      const buffer = await workbook.xlsx.writeBuffer();
      var blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `TBS_BTF_output_${dateTime}.xlsx`);
    } catch (error) {
      console.error("Error creating Excel:", error);
      throw new Error("Failed to create Excel file");
    }
  },
};

export default excelService;
