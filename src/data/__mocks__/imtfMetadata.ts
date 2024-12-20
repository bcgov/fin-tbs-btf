import { FieldMetadata } from "../imtfTypes";

// prettier-ignore
// Mock all kinds of metadata
export const fieldsMetadata: FieldMetadata[] = [
  { name: "LAST_ACTED_ON_AUDIT_TS", required: true, type: "date" },
  { name: "field_text", required: true, type: "text" },
  { name: "field_number", required: false, type: "number" },
  { name: "field_date", type: "date" },
  { name: "field_dropDown", dropDownKey: "field_text" },
  { name: "field_horizontalAlign", horizontalAlign: "right" },
  { name: "field_overrideValue", overrideValue: "test override" },
  { name: "field_useDisplayedValue", useDisplayedValue: true },
];
