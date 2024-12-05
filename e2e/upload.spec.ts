import { test } from "@playwright/test";
import { PageState, UploadPage } from "./pages/uploadPage";
import { FileAsset } from "./utils/BtfFile";

test.describe("Upload Page", () => {
  test.describe("upload button", () => {
    test("uploading multiple files should show on the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("uploading more files will add them to the list", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.uploadAssets([FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("upload the same files again will not add to the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.uploadAssets([FileAsset.SEMIVALID]);
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
  });
  test.describe("drag and drop", () => {
    test("upload multiple files", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.dropAsset([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
  });
  test.describe("button states", () => {
    test("empty list - only upload enabled", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.expectState();
    });
    test("valid list - everything enabled", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.expectState(PageState.SUCCESS);
    });
    test("warning list - everything enabled", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.SEMIVALID]);
      await uploadPage.expectState(PageState.WARNING);
    });
    test("error list - only download disabled", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.INVALID]);
      await uploadPage.expectState(PageState.ERROR);
    });
  });
  test.describe("clear button", () => {
    test("remove all files", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.clearForm();
      await uploadPage.expectAssets([]);
    });
    test("should allow uploading new files after clearing", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.clearForm();
      await uploadPage.expectAssets([]);
      // confirm that new files can be uploaded
      await uploadPage.uploadAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
  });
  test.describe("remove button", () => {
    test("remove files one at a time", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([
        FileAsset.VALID,
        FileAsset.INVALID,
        FileAsset.SEMIVALID,
      ]);
      await uploadPage.expectAssets([
        FileAsset.VALID,
        FileAsset.INVALID,
        FileAsset.SEMIVALID,
      ]);
      await uploadPage.removeItem(1);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.removeItem(1);
      await uploadPage.expectAssets([FileAsset.VALID]);
      await uploadPage.removeItem(0);
      await uploadPage.expectAssets([]);
    });
  });
  test.describe("download button", () => {
    test("download file and verify contents", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      const file = await uploadPage.download();
      await file.expectDownloadedFile([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("download again after modifying list", async ({ page }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      let file = await uploadPage.download();
      await file.expectDownloadedFile([FileAsset.VALID]);
      await uploadPage.clearForm();
      await uploadPage.uploadAssets([FileAsset.SEMIVALID, FileAsset.INVALID]);
      await uploadPage.removeItem(1);
      file = await uploadPage.download();
      await file.expectDownloadedFile([FileAsset.SEMIVALID]);
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.expectAssets([FileAsset.SEMIVALID, FileAsset.VALID]);
      file = await uploadPage.download();
      await file.expectDownloadedFile([FileAsset.SEMIVALID, FileAsset.VALID]);
    });
  });
});
