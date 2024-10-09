import * as XLSX from "xlsx";

interface Audit {
  createdDate: string;
  loginDate: string;
  idir: string;
}

const excelService = {
  /**
   * Function to export extracted form data to an Excel file.
   * This will be presented as a download to the user.
   * @param extractedData - The array of extracted form data
   * @param columnOrder - The order of columns to be used in the Excel file
   */
  async exportToExcel(
    extractedData: any[],
    columnOrder: string[],
    columnDefaults: Record<string, string>,
    audit: Audit,
  ) {
    try {
      // Each row only needs the information from the columnOrder, nothing else
      const formattedData = extractedData.map((data: any) => {
        const rowData: any = {};
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

      // Generate the audit worksheet
      const auditData = [
        {
          "Created/Modified Date": audit.createdDate,
          IDIR: audit.idir,
          "Login Date": audit.loginDate,
        },
      ];
      const auditWorksheet = XLSX.utils.json_to_sheet(auditData);
      auditWorksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, auditWorksheet, "METADATA");

      // Download the Excel file
      const dateTime = excelServicePrivate.getDateTimeStr(new Date());
      XLSX.writeFile(workbook, `TBS_BTF_output_${dateTime}.xlsx`, {
        compression: true,
      });
    } catch (error) {
      console.error("Error creating Excel:", error);
      throw new Error("Failed to create Excel file");
    }
  },
};

const excelServicePrivate = {
  getDateTimeStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    return timestamp;
  },
};

export default excelService;
