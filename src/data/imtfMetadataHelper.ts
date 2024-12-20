import { fieldsMetadata } from "./imtfMetadata";

// export class ImtfMetadata {
//   /** Lookup a field by name. */
//   lookupByName: Map<string, FieldMetadata>;

//   /**
//    * These are the expected fields to exist in the pdfs.
//    * If any of these fields don't exist, then it's the
//    * wrong pdf, or the pdf has been modified in some way.
//    */
//   pdfRequiredFields: string[];

//   /**
//    * These are the optional fields to exist in the pdfs.
//    * Even if they aren't present, it's okay to continue.
//    */
//   pdfOptionalFields: string[];

//   constructor(fieldsMetadata: FieldMetadata[]) {
//     this.lookupByName = new Map(fieldsMetadata.map((col) => [col.name, col]));

//     this.pdfRequiredFields = fieldsMetadata
//       .filter((col) => col.required === true)
//       .map((col) => col.name);

//     this.pdfOptionalFields = fieldsMetadata
//       .filter((col) => col.required === false)
//       .map((col) => col.name);
//   }
// }

// export const ImtfMetadata2 = {
//   /** Lookup a field by name. */
//   getlookupByName: (fieldsMetadata: FieldMetadata[]) =>
//     new Map(fieldsMetadata.map((col) => [col.name, col])),

//   /**
//    * These are the expected fields to exist in the pdfs.
//    * If any of these fields don't exist, then it's the
//    * wrong pdf, or the pdf has been modified in some way.
//    */
//   getRequiredFields: (fieldsMetadata: FieldMetadata[]) =>
//     fieldsMetadata
//       .filter((col) => col.required === true)
//       .map((col) => col.name),

//   /**
//    * These are the optional fields to exist in the pdfs.
//    * Even if they aren't present, it's okay to continue.
//    */
//   getOptionalFields: (fieldsMetadata: FieldMetadata[]) =>
//     fieldsMetadata
//       .filter((col) => col.required === false)
//       .map((col) => col.name),
// };

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
