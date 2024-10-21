import { DateTimeFormatter, ZonedDateTime, ZoneId } from "@js-joda/core";
import * as XLSX from "xlsx";

const excelService = {
  /**
   * Function to export extracted form data to an Excel file.
   * This will be presented as a download to the user.
   * @param extractedData - The array of extracted form data
   * @param columnOrder - The order of columns to be used in the Excel file
   */
  async exportToExcel(
    extractedData: Record<string, string>[],
    columnOrder: string[],
    columnDefaults: Record<string, string>,
    auditData: Record<string, string>,
  ) {
    try {
      // Each row only needs the information from the columnOrder, nothing else
      const formattedData = extractedData.map((data) => {
        const rowData: Record<string, string> = {};
        columnOrder.forEach((title) => {
          rowData[title] = data[title] || "";
        });

        // Add/Replace default information
        for (var k in columnDefaults) {
          if (columnDefaults.hasOwnProperty(k)) {
            rowData[k] = columnDefaults[k];
          }
        }

        return rowData;
      });

      // Generate the worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        header: columnOrder,
      });

      // Calculate maximum width of each column (header + content)
      const columnWidths = columnOrder.map((col) => {
        const maxContentWidth = Math.max(
          col.length, // The column header length
          ...formattedData.map((row) =>
            row[col] ? row[col].toString().length : 0,
          ), // The maximum length of data in this column
        );

        return { wch: maxContentWidth + 3 };
      });
      worksheet["!cols"] = columnWidths;

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DATA");

      // Convert auditData object into an array of { Label, Value } objects
      const formattedAuditData = Object.entries(auditData).map(
        ([key, value]) => ({ Label: key, Value: value }),
      );
      const auditWorksheet = XLSX.utils.json_to_sheet(formattedAuditData, {
        header: ["Label", "Value"],
      });
      auditWorksheet["!cols"] = [{ wch: 15 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, auditWorksheet, "METADATA");

      // Download the Excel file
      const dateTime = ZonedDateTime.now(ZoneId.systemDefault()).format(
        DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"),
      );
      XLSX.writeFile(workbook, `TBS_BTF_output_${dateTime}.xlsx`, {
        compression: true,
      });
    } catch (error) {
      console.error("Error creating Excel:", error);
      throw new Error("Failed to create Excel file");
    }
  },
};

export default excelService;
