export type FieldMetadata = {
  /** Name is the field in the input data and also the colunm header in the output. */
  name: string;
  /** Column type in the output */
  type?: "number" | "text" | "date";
  horizontalAlign?:
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
