import { test } from "@playwright/test";
import { PageState, UploadPage } from "./pages/uploadPage";
import { FileAsset } from "./utils/BtfFile";

test.describe("Upload Page", () => {
  test.describe("upload button", () => {
    test("submitting multiple files via the file chooser will add all selected files to the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("submitting another file to an already populated list should add the new file at the bottom of the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.uploadAssets([FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("submitting a file that is already in the list should ignore the file and not add it to the list", async ({
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
    test("selecting multiple files from the computer and dragging and dropping them on the control should add all files to the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.dropAsset([FileAsset.VALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
  });
  test.describe("button states", () => {
    test("when there are no files in the list (ie. an empty list), then only the upload upload button should be enabled", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.expectState();
    });
    test("when the list contains only valid items, then all the buttons should be enabled", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID]);
      await uploadPage.expectState(PageState.SUCCESS);
    });
    test("when the list contains at least one file with a warning, then all the buttons should be enabled", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.SEMIVALID]);
      await uploadPage.expectState(PageState.WARNING);
    });
    test("when the list contains at least one file with an error, then the download button should be disabled and all others should be enabled", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.INVALID]);
      await uploadPage.expectState(PageState.ERROR);
    });
  });
  test.describe("clear button", () => {
    test("there should be no files in the list after clearing the list", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.expectAssets([FileAsset.INVALID, FileAsset.SEMIVALID]);
      await uploadPage.clearForm();
      await uploadPage.expectAssets([]);
    });
    test("after clearing the list, newly uploaded files are correctly added to the list", async ({
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
  test.describe("remove button (beside each file)", () => {
    test("pressing the remove button next to a file removes only that file from the list", async ({
      page,
    }) => {
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
    test("clicking the download button generates an Excel file with accurate and expected contents", async ({
      page,
    }) => {
      const uploadPage = new UploadPage(page);
      await uploadPage.visit();
      await uploadPage.uploadAssets([FileAsset.VALID, FileAsset.SEMIVALID]);
      const file = await uploadPage.download();
      await file.expectDownloadedFile([FileAsset.VALID, FileAsset.SEMIVALID]);
    });
    test("the downloaded file accurately reflects the current state of the list after making multiple modifications", async ({
      page,
    }) => {
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
