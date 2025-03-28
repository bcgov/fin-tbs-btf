import { FieldMetadata } from "./imtfTypes";

// prettier-ignore
/** The expected data, columns, and format for both the input pdf and output excel. */
export const fieldsMetadata: FieldMetadata[] = [
  { name: "CONTROL_NUM", horizontalAlign: "right", required: true },
  { name: "STATUS_DESCR", overrideValue: "Processed" },
  { name: "EFFECTIVE_DT", type: "date", horizontalAlign: "right", useDisplayedValue: true },
  { name: "LAST_ACTED_ON_AUDIT_TS", type: "date", horizontalAlign: "right" },
  { name: "NEXT_TO_ACT_LAST_NAME", overrideValue: "Estimates" },
  { name: "NEXT_TO_ACT_FIRST_NAME", overrideValue: "TBS" },
  { name: "FROM_CLIENT_CD", type: "text", horizontalAlign: "right", required: false },
  { name: "FROM_CLIENT_NAME", required: true, dropDownKey: "FROM_CLIENT_CD" },
  { name: "TO_CLIENT_CD", type: "text", horizontalAlign: "right", required: false },
  { name: "TO_CLIENT_NAME", required: true, dropDownKey: "TO_CLIENT_CD" },
  { name: "FISCAL_YEAR", type: "number", required: true },
  { name: "TRANSFER_REASON", required: true },
  { name: "BUDGETR_GROSS_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET_GROSS_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET1_GROSS_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET2_GROSS_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGETR_RECOV_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET_RECOV_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET1_RECOV_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGET2_RECOV_OPERATING_AMT", type: "number", required: true },
  { name: "BUDGETR_CAPITAL_AMT", type: "number", required: true },
  { name: "BUDGET_CAPITAL_AMT", type: "number", required: true },
  { name: "BUDGET1_CAPITAL_AMT", type: "number", required: true },
  { name: "BUDGET2_CAPITAL_AMT", type: "number", required: true },
  { name: "BUDGETR_FTE_CNT", type: "number", required: true },
  { name: "BUDGET_FTE_CNT", type: "number", required: true },
  { name: "BUDGET1_FTE_CNT", type: "number", required: true },
  { name: "BUDGET2_FTE_CNT", type: "number", required: true },
  { name: "BUDGETR_RECEIPT_FIN_AMT", type: "number", required: true },
  { name: "BUDGET_RECEIPT_FIN_AMT", type: "number", required: true },
  { name: "BUDGET1_RECEIPT_FIN_AMT", type: "number", required: true },
  { name: "BUDGET2_RECEIPT_FIN_AMT", type: "number", required: true },
  { name: "BUDGETR_DISBURSE_FIN_AMT", type: "number", required: true },
  { name: "BUDGET_DISBURSE_FIN_AMT", type: "number", required: true },
  { name: "BUDGET1_DISBURSE_FIN_AMT", type: "number", required: true },
  { name: "BUDGET2_DISBURSE_FIN_AMT", type: "number", required: true },
  { name: "BUDGETR_STOBS_REV_AMT", type: "number", required: true },
  { name: "BUDGET_STOBS_REV_AMT", type: "number", required: true },
  { name: "BUDGET1_STOBS_REV_AMT", type: "number", required: true },
  { name: "BUDGET2_STOBS_REV_AMT", type: "number", required: true },
  { name: "BUDGETR_COMMISSION_AMT", type: "number", required: true },
  { name: "BUDGET_COMMISSION_AMT", type: "number", required: true },
  { name: "BUDGET1_COMMISSION_AMT", type: "number", required: true },
  { name: "BUDGET2_COMMISSION_AMT", type: "number", required: true },
  { name: "BUDGETR_DOUBTFUL_ACCT_AMT", type: "number", required: true },
  { name: "BUDGET_DOUBTFUL_ACCT_AMT", type: "number", required: true },
  { name: "BUDGET1_DOUBTFUL_ACCT_AMT", type: "number", required: true },
  { name: "BUDGET2_DOUBTFUL_ACCT_AMT", type: "number", required: true },
  { name: "STOBS_DESCR" },
];
