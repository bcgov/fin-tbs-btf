import { Download, expect, Locator, Page } from "playwright/test";
import { BasePage } from "./basePage";
import { dragAndDropFile, FileDropInfo } from "../utils/playwrightUtils";
import {
  BtfGeneratedFile,
  dicToAssetToData,
  FileAsset,
} from "../utils/BtfFile";

export enum PageState {
  SUCCESS,
  ERROR,
  WARNING,
}

/**
 * This class provides functions to interact with the upload form.
 */
export class UploadPage extends BasePage {
  downloadButton: Locator;
  uploadButton: Locator;
  clearButton: Locator;
  dropFileZone: Locator;
  fileInput: Locator;
  warningTitle: Locator;
  errorTitle: Locator;
  fileList: Locator;
  filesCountTitle: Locator; // header above the list, but only when there is a count, eg "Files (xx)"
  dropMessage: Locator; // text telling users to drop the files
  downloadedFile: Download; // after clicking download, the file will be here

  constructor(page: Page) {
    super(page);
    this.downloadButton = this.page.getByRole("button", {
      name: "Download Excel",
    });
    this.uploadButton = this.page.getByRole("button", {
      name: "Upload PDF",
    });
    this.clearButton = this.page.getByRole("button", {
      name: "Clear",
    });
    this.dropFileZone = this.page.locator("#dropzone");
    this.fileInput = this.page.locator("#fileChooser");

    this.warningTitle = this.page.getByText("file(s) have missing fields");
    this.errorTitle = this.page.getByText(
      "file(s) have errors in formatting or content",
    );
    this.fileList = this.page.locator(".v-list .v-list-item");
    this.filesCountTitle = this.page.getByText("Files").first();
    this.dropMessage = this.page.getByRole("heading", {
      name: "Drop PDF files here",
    });
  }

  /** Uploads files from the asset folder in a single filechooser dialog. */
  async uploadAssets(status: FileAsset[]) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.uploadButton.click();
    const fileChooser = await fileChooserPromise;
    const files = status.map((x) => dicToAssetToData[x].path);
    await fileChooser.setFiles(files);
    await this.waitForLoadingFiles();
  }

  async dropAsset(assets: FileAsset[]) {
    const files: FileDropInfo[] = assets.map((x) => dicToAssetToData[x]);
    await dragAndDropFile(this.page, this.dropFileZone, files);
    await this.waitForLoadingFiles();
  }

  async clearForm() {
    await this.clearButton.click();
  }

  async removeItem(index: number) {
    await this.fileList.nth(index).getByRole("button").click();
  }

  async download() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.downloadButton.click();
    this.downloadedFile = await downloadPromise;
    return new BtfGeneratedFile(this.downloadedFile);
  }

  //////////
  // EXPECT
  //////////

  /** expect the counts, filenames, icons, and missingFields to match inputted status. */
  async expectAssets(assets: FileAsset[]) {
    await this.expectFileCount(
      assets.length,
      assets.filter((s) => s === FileAsset.SEMIVALID).length,
      assets.filter((s) => s === FileAsset.INVALID).length,
    );
    for (let i = 0; i < assets.length; ++i) {
      const data = dicToAssetToData[assets[i]];
      await expect(this.fileList.nth(i).locator(".v-icon").first()).toHaveClass(
        new RegExp(data.icon),
      );
      await expect(
        this.fileList.nth(i).locator(".v-list-item__content"),
      ).toContainText(data.fileName);
      for (const field of data.missingFields ?? []) {
        await expect(
          this.fileList.nth(i).locator(".v-list-item__content"),
        ).toContainText(field);
      }
    }
  }

  /** Expect buttons and other page elements to be enabled/disabled depending on state */
  async expectState(state?: PageState) {
    await expect(this.downloadButton).toBeVisible();
    await expect(this.uploadButton).toBeVisible();
    await expect(this.uploadButton).toBeEnabled();
    await expect(this.clearButton).toBeVisible();
    if (state == undefined) {
      // empty form
      await expect(this.downloadButton).toBeDisabled();
      await expect(this.clearButton).toBeDisabled();
      await expect(this.dropMessage).toBeVisible();
    } else if (state == PageState.SUCCESS || state == PageState.WARNING) {
      await expect(this.downloadButton).toBeEnabled();
      await expect(this.clearButton).toBeEnabled();
      await expect(this.dropMessage).toBeHidden();
    } else if (state == PageState.ERROR) {
      await expect(this.downloadButton).toBeDisabled();
      await expect(this.clearButton).toBeEnabled();
      await expect(this.dropMessage).toBeHidden();
    }
  }

  ////////////
  // UTILITY
  ////////////

  /** Wait for all items to be loaded after adding new items. */
  private async waitForLoadingFiles() {
    // Each item starts with only one icon (x button),
    // then when loaded, there are two icons (status and X button)
    for (let i = 0; i < (await this.getFilesCount()); ++i) {
      await this.fileList.nth(i).locator(".v-icon").nth(1).waitFor();
    }
  }

  private async expectFileCount(
    totalFilesCount: number,
    warningCount: number,
    errorCount: number,
  ) {
    await expect(this.fileList).toHaveCount(totalFilesCount);
    expect(await this.getFilesCount()).toBe(totalFilesCount);
    expect(await this.getWarningCount()).toBe(warningCount);
    expect(await this.getErrorCount()).toBe(errorCount);
  }

  private async getFilesCount(): Promise<number> {
    const isVisible = await this.filesCountTitle.isVisible();
    if (!isVisible) return 0;
    const str = await this.filesCountTitle.innerText();
    return parseInt(str.match(/\d+/)?.[0] || "0", 10);
  }

  private async getWarningCount(): Promise<number> {
    const isVisible = await this.warningTitle.isVisible();
    if (!isVisible) return 0;
    const text = await this.warningTitle.innerText();
    return Number.parseInt(text.split(" ", 1)[0]);
  }

  private async getErrorCount(): Promise<number> {
    const isVisible = await this.errorTitle.isVisible();
    if (!isVisible) return 0;
    const text = await this.errorTitle.innerText();
    return Number.parseInt(text.split(" ", 1)[0]);
  }
}
