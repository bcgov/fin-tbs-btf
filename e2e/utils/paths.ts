const baseURL = process.env.E2E_AUTO_TEST_BASE_URL ?? "";

export const PagePaths = {
  BASE: baseURL,
  LOGIN: `${baseURL}/login`,
  UPLOAD: `${baseURL}/upload`,
};
