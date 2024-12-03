import { Download, expect } from "playwright/test";
import path from "path";
import { FileDropInfo } from "./playwrightUtils";
import { LocalDateTime, ZonedDateTime } from "@js-joda/core";
import * as XLSX from "xlsx";
import { buffer } from "node:stream/consumers";

/*
 * This file contains the functions and data manage and validate the
 * existing three files in the asset folder, as well as create new
 * files in a Buffer.
 */

export enum FileAsset {
  VALID,
  INVALID,
  SEMIVALID,
}

type AssetData = FileDropInfo & {
  icon: string;
  missingFields?: string[];
  validValues?: string[];
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
      "01-Jan-25",
      "2024-11-20 04:13:08 PM",
      "Estimates",
      "TBS",
      "128",
      "Forests",
      "026",
      "Health",
      "2024",
      "test_19",
    ].concat(...Array.from({ length: 36 }, (v, k) => (k + 10).toString()), ""),
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
      "",
      "2024-10-21 12:09:00 PM",
      "Estimates",
      "TBS",
      "",
      " ",
      "",
      " ",
    ].concat(...Array(38).fill(""), ""),
  },
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
    const workbook = XLSX.read(await buffer(stream), {
      type: "buffer",
    });
    expect(workbook.SheetNames.length).toBe(2);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData: string[][] = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
    });

    //number of rows
    expect(sheetData).toHaveLength(assets.length + 1);

    //header row only has uppercase and underscore
    for (const item of sheetData[0]) expect(item).toMatch(/[A-Z_]/);

    //values match file
    for (let i = 0; i < assets.length; ++i)
      expect(sheetData[i + 1]).toStrictEqual(
        dicToAssetToData[assets[i]].validValues,
      );

    //metadata
    const secondSheet = workbook.Sheets[workbook.SheetNames[1]];
    const sheetMetaData: string[][] = XLSX.utils.sheet_to_json(secondSheet, {
      header: 1,
    });

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