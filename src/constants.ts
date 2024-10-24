export const excelColumnOrder = [
  "CONTROL_NUM",
  "STATUS_DESCR",
  "EFFECTIVE_DT",
  "LAST_ACTED_ON_AUDIT_TS",
  "NEXT_TO_ACT_LAST_NAME",
  "NEXT_TO_ACT_FIRST_NAME",
  "FROM_CLIENT_CD",
  "FROM_CLIENT_NAME",
  "TO_CLIENT_CD",
  "TO_CLIENT_NAME",
  "FISCAL_YEAR",
  "TRANSFER_REASON",
  "BUDGETR_GROSS_OPERATING_AMT",
  "BUDGET_GROSS_OPERATING_AMT",
  "BUDGET1_GROSS_OPERATING_AMT",
  "BUDGET2_GROSS_OPERATING_AMT",
  "BUDGETR_RECOV_OPERATING_AMT",
  "BUDGET_RECOV_OPERATING_AMT",
  "BUDGET1_RECOV_OPERATING_AMT",
  "BUDGET2_RECOV_OPERATING_AMT",
  "BUDGETR_CAPITAL_AMT",
  "BUDGET_CAPITAL_AMT",
  "BUDGET1_CAPITAL_AMT",
  "BUDGET2_CAPITAL_AMT",
  "BUDGETR_FTE_CNT",
  "BUDGET_FTE_CNT",
  "BUDGET1_FTE_CNT",
  "BUDGET2_FTE_CNT",
  "BUDGETR_RECEIPT_FIN_AMT",
  "BUDGET_RECEIPT_FIN_AMT",
  "BUDGET1_RECEIPT_FIN_AMT",
  "BUDGET2_RECEIPT_FIN_AMT",
  "BUDGETR_DISBURSE_FIN_AMT",
  "BUDGET_DISBURSE_FIN_AMT",
  "BUDGET1_DISBURSE_FIN_AMT",
  "BUDGET2_DISBURSE_FIN_AMT",
  "BUDGETR_STOBS_REV_AMT",
  "BUDGET_STOBS_REV_AMT",
  "BUDGET1_STOBS_REV_AMT",
  "BUDGET2_STOBS_REV_AMT",
  "BUDGETR_COMMISSION_AMT",
  "BUDGET_COMMISSION_AMT",
  "BUDGET1_COMMISSION_AMT",
  "BUDGET2_COMMISSION_AMT",
  "BUDGETR_DOUBTFUL_ACCT_AMT",
  "BUDGET_DOUBTFUL_ACCT_AMT",
  "BUDGET1_DOUBTFUL_ACCT_AMT",
  "BUDGET2_DOUBTFUL_ACCT_AMT",
  "STOBS_DESCR",
];

/**
 * These are the expected fields to exist in the pdfs.
 * If any of these fields don't exist, then it's the
 * wrong pdf, or the pdf has been modified in some way.
 */
export const pdfRequiredFields = [
  "CONTROL_NUM",
  "FROM_CLIENT_NAME",
  "TO_CLIENT_NAME",
  "FISCAL_YEAR",
  "TRANSFER_REASON",
  "BUDGETR_GROSS_OPERATING_AMT",
  "BUDGET_GROSS_OPERATING_AMT",
  "BUDGET1_GROSS_OPERATING_AMT",
  "BUDGET2_GROSS_OPERATING_AMT",
  "BUDGETR_RECOV_OPERATING_AMT",
  "BUDGET_RECOV_OPERATING_AMT",
  "BUDGET1_RECOV_OPERATING_AMT",
  "BUDGET2_RECOV_OPERATING_AMT",
  "BUDGETR_CAPITAL_AMT",
  "BUDGET_CAPITAL_AMT",
  "BUDGET1_CAPITAL_AMT",
  "BUDGET2_CAPITAL_AMT",
  "BUDGETR_FTE_CNT",
  "BUDGET_FTE_CNT",
  "BUDGET1_FTE_CNT",
  "BUDGET2_FTE_CNT",
  "BUDGETR_RECEIPT_FIN_AMT",
  "BUDGET_RECEIPT_FIN_AMT",
  "BUDGET1_RECEIPT_FIN_AMT",
  "BUDGET2_RECEIPT_FIN_AMT",
  "BUDGETR_DISBURSE_FIN_AMT",
  "BUDGET_DISBURSE_FIN_AMT",
  "BUDGET1_DISBURSE_FIN_AMT",
  "BUDGET2_DISBURSE_FIN_AMT",
  "BUDGETR_STOBS_REV_AMT",
  "BUDGET_STOBS_REV_AMT",
  "BUDGET1_STOBS_REV_AMT",
  "BUDGET2_STOBS_REV_AMT",
  "BUDGETR_COMMISSION_AMT",
  "BUDGET_COMMISSION_AMT",
  "BUDGET1_COMMISSION_AMT",
  "BUDGET2_COMMISSION_AMT",
  "BUDGETR_DOUBTFUL_ACCT_AMT",
  "BUDGET_DOUBTFUL_ACCT_AMT",
  "BUDGET1_DOUBTFUL_ACCT_AMT",
  "BUDGET2_DOUBTFUL_ACCT_AMT",
];

/**
 * These are the optional fields to exist in the pdfs.
 * Even if they aren't present, it's okay to continue.
 */
export const pdfOptionalFields = ["FROM_CLIENT_CD", "TO_CLIENT_CD"];

export const excelColumnDefaults: Record<string, string> = {
  STATUS_DESCR: "Processed",
  NEXT_TO_ACT_LAST_NAME: "Estimates",
  NEXT_TO_ACT_FIRST_NAME: "TBS",
  STOBS_DESCR: "",
};
