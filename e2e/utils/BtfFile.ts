import { Download, expect } from "playwright/test";
import path from "path";
import { FileDropInfo } from "./playwrightUtils";
import { LocalDateTime, ZonedDateTime } from "@js-joda/core";
import { buffer } from "node:stream/consumers";
import { utimes } from "node:fs/promises";
import ExcelJS from "exceljs";
import { workbookToJson } from "./excelUtils";

/*
 * This file contains the functions and data manage and validate the
 * existing three files in the asset folder, as well as create new
 * files in a Buffer.
 */

// the last modified date of the assets
const assetLastModifiedDate_timestamp = "2024-10-21T19:09:00.000Z"; // Used to set the timestamp of the file
const assetLastModifiedDate_output = "2024-10-21T00:00:00.000Z"; // The expected value to be shown in the output

export enum FileAsset {
  VALID,
  INVALID,
  SEMIVALID,
}

type AssetData = FileDropInfo & {
  icon: string;
  missingFields?: string[];
  validValues?: (string | number | Date | null)[];
};

/** Dictionary containing all the information on the three test files in the assets folder. */
export const dicToAssetToData: Record<FileAsset, AssetData> = {
  [FileAsset.VALID]: {
    fileName: "valid.pdf",
    path: path.resolve("e2e", "assets", "valid.pdf"),
    mimeType: "application/pdf",
    icon: "mdi-check",
    validValues: [
      "TBS Use Only",
      "Processed",
      new Date("2025-01-01T00:00:00.000Z"),
      new Date(assetLastModifiedDate_output),
      "Estimates",
      "TBS",
      "128",
      "Forests",
      "026",
      "Health",
      2024,
      "test_19",
    ].concat(...Array.from({ length: 36 }, (v, k) => k + 10)),
  },
  [FileAsset.INVALID]: {
    fileName: "invalid.pdf",
    path: path.resolve("e2e", "assets", "invalid.pdf"),
    mimeType: "application/pdf",
    icon: "mdi-alert-circle",
  },
  [FileAsset.SEMIVALID]: {
    fileName: "semi-valid.pdf",
    path: path.resolve("e2e", "assets", "semi-valid.pdf"),
    mimeType: "application/pdf",
    icon: "mdi-alert",
    missingFields: ["FROM_CLIENT_CD", "TO_CLIENT_CD"],
    validValues: [
      "TBS Use Only",
      "Processed",
      null,
      new Date(assetLastModifiedDate_output),
      "Estimates",
      "TBS",
      null,
      " ",
      null,
      " ",
      NaN,
      "",
    ].concat(...Array(36).fill(NaN)),
  },
};

/** Set the modified date of the assets for some of the tests. */
export const initAssets = async () => {
  const date = new Date(assetLastModifiedDate_timestamp);
  for (const [key, value] of Object.entries(dicToAssetToData)) {
    await utimes(value.path, date, date);
  }
};

/**
 * This class provides functions to interact with the downloaded file.
 */
export class BtfGeneratedFile {
  constructor(public readonly downloadedFile: Download) {}

  //////////
  // EXPECT
  //////////

  async expectDownloadedFile(assets: FileAsset[]) {
    // verify that the timestamp in the filename is within the last 5 minutes
    const matches = this.downloadedFile.suggestedFilename().match(/\d+/g);
    const arr = matches ? matches.map(Number) : [];

    expect(arr).toHaveLength(6);
    const date = LocalDateTime.of(
      arr[0],
      arr[1],
      arr[2],
      arr[3],
      arr[4],
      arr[5],
    );
    expect(date.isBefore(LocalDateTime.now())).toBeTruthy();
    expect(date.isAfter(LocalDateTime.now().minusMinutes(5))).toBeTruthy();

    // load xlsx
    const stream = await this.downloadedFile.createReadStream();

    const temp = new ExcelJS.Workbook();
    const workbook = await temp.xlsx.load(await buffer(stream));
    const book: any[] = workbookToJson(workbook);

    expect(book).toHaveLength(2);
    const sheetData = book[0];

    //number of rows
    expect(sheetData).toHaveLength(assets.length + 1);

    //header row only has uppercase and underscore
    for (const value of sheetData[0]) expect(value).toMatch(/[A-Z_]/);

    //values match file
    for (let i = 0; i < assets.length; ++i)
      expect(sheetData[i + 1]).toStrictEqual(
        dicToAssetToData[assets[i]].validValues,
      );

    //metadata
    const sheetMetaData = book[1];

    for (const [key, value] of sheetMetaData) {
      if (key == "Label") expect(value).toBe("Value");
      else if (key == "IDIR") expect(value).toMatch(/[A-Z]+/);
      else if (key == "Email") expect(value).toMatch(/@gov.bc.ca/);
      else if (key == "Name") expect(value.length).toBeTruthy();
      else if (key == "Login Date") {
        const dateLogin = ZonedDateTime.parse(value);
        expect(dateLogin.isBefore(ZonedDateTime.now())).toBeTruthy();
        expect(
          dateLogin.isAfter(ZonedDateTime.now().minusMinutes(5)),
        ).toBeTruthy();
      } else if (key == "File Created") {
        const dateCreated = ZonedDateTime.parse(value);
        expect(dateCreated.isBefore(ZonedDateTime.now())).toBeTruthy();
        expect(
          dateCreated.isAfter(ZonedDateTime.now().minusMinutes(5)),
        ).toBeTruthy();
      } else if (key == "# PDFs") expect(value).toBe(assets.length.toString());
      else expect(`unknown metadata row '${key}'`).toBeFalsy();
    }
  }
}
