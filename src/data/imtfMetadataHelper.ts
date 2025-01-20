import { fieldsMetadata } from "./imtfMetadata";

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
