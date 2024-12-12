export type Annotation = {
  annotationFlags: number;
  borderStyle: {
    //TODO:
    width: number;
    rawWidth: number;
    style: number;
    dashArray: number[];
    horizontalCornerRadius: number;
    verticalCornerRadius: number;
  };
  color: Uint8ClampedArray;
  backgroundColor: Uint8ClampedArray;
  borderColor: Uint8ClampedArray;
  rotation: number;
  contentsObj: {
    str: string;
    dir: string;
  };
  hasAppearance: boolean;
  id: string;
  modificationDate: any;
  rect: number[];
  subtype: string;
  hasOwnCanvas: boolean;
  noRotate: boolean;
  noHTML: boolean;
  isEditable: boolean;
  structParent: number;
  annotationType: number;
  fieldName: string;
  actions: any;
  fieldValue: string;
  defaultFieldValue: string;
  alternativeText: string;
  defaultAppearanceData: {
    fontSize: number;
    fontName: string;
    fontColor: Uint8ClampedArray;
  };
  fieldType: string;
  fieldFlags: number;
  readOnly: boolean;
  required: boolean;
  hidden: boolean;
  textAlignment: number;
  maxLen: number;
  multiLine: boolean;
  comb: boolean;
  doNotScroll: boolean;
  textPosition: number[];
  textContent: string[];
  options: {
    exportValue: string;
    displayValue: string;
  }[];
  combo: boolean;
  multiSelect: boolean;
};
