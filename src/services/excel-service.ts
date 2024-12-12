import { DateTimeFormatter, LocalDateTime } from "@js-joda/core";
import ExcelJS from "exceljs";
import { fieldsMetadata } from "../constants";
import { saveAs } from "file-saver";

const excelService = {
  /**
   * Function to export extracted form data to an Excel file.
   * This will be presented as a download to the user.
   * @param inputRows - The array of extracted form data. Each element is an object representing a row of data.
   * @param fieldMetadata - The order of columns to be used in the Excel file
   */
  async exportToExcel(
    inputRows: Record<string, string | number | Date | null>[],
    auditData: Record<string, string>,
  ) {
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("DATA");

      worksheet.columns = fieldsMetadata.map((x) => ({
        header: x.name,
        key: x.name,
        width: x.name.length * 1.25, // make slightly larger because headers are in all caps
        style: {
          numFmt: x.type === "date" ? "d-mmm-yy" : undefined,
          alignment: x.horizontalalign
            ? { horizontal: x.horizontalalign }
            : undefined,
        },
      }));

      // Add data rows and apply alignment
      worksheet.addRows(inputRows, "i");

      // Audit sheet
      const auditWorksheet = workbook.addWorksheet("METADATA");
      auditWorksheet.columns = [
        { header: "Label", key: "key", width: 15 },
        { header: "Value", key: "value", width: 25 },
      ];
      auditWorksheet.addRows(Object.entries(auditData));

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
