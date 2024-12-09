export type FieldMetadata = {
  /** Name is the field in the input data and also the colunm header in the output. */
  name: string;
  /** Column type in the output */
  type?: "number" | "text" | "date";
  align?:
    | "fill"
    | "left"
    | "right"
    | "center"
    | "justify"
    | "centerContinuous"
    | "distributed"
    | undefined;
  /** true: Field is required to exist for data to be considered valid. false: Field is optional. undefined: Neither required nor optional. */
  required?: boolean;
  /** Override any value in the column to be this value if it is set. */
  overrideValue?: string;
  /** Use the "dipslay value" from a PDF field instead of the input value. */
  useDisplayedValue?: boolean;
  /** Store the key of a dropdown in specified property. (Dropdowns in PDFs have a key=>value pair.) */
  dropDownKey?: string;
};

// prettier-ignore
/**  */
export const fieldsMetadata: FieldMetadata[] = [
  { name: "CONTROL_NUM", align: "right", required: true },
  { name: "STATUS_DESCR", overrideValue: "Processed" },
  { name: "EFFECTIVE_DT", type: "date", align: "right", useDisplayedValue: true },
  { name: "LAST_ACTED_ON_AUDIT_TS", type: "date", align: "right" },
  { name: "NEXT_TO_ACT_LAST_NAME", overrideValue: "Estimates" },
  { name: "NEXT_TO_ACT_FIRST_NAME", overrideValue: "TBS" },
  { name: "FROM_CLIENT_CD", type: "text", align: "right", required: false },
  { name: "FROM_CLIENT_NAME", required: true, dropDownKey: "FROM_CLIENT_CD" },
  { name: "TO_CLIENT_CD", type: "text", align: "right", required: false },
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

/** Lookup a field by name. */
export const fieldsMetadataLookupByName = new Map(
  fieldsMetadata.map((col) => [col.name, col]),
);

/**
 * These are the expected fields to exist in the pdfs.
 * If any of these fields don't exist, then it's the
 * wrong pdf, or the pdf has been modified in some way.
 */
export const pdfRequiredFields = fieldsMetadata
  .filter((col) => col.required === true)
  .map((col) => col.name);

/**
 * These are the optional fields to exist in the pdfs.
 * Even if they aren't present, it's okay to continue.
 */
export const pdfOptionalFields = fieldsMetadata
  .filter((col) => col.required === false)
  .map((col) => col.name);
