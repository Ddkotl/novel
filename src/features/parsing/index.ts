import { Browser, chromium } from "playwright";
import { addHTTPheaders } from "./functions/addHttpHeader";
import { parseAllNovels } from "./modules/parse_all_novells";

export async function startParse() {
  console.log("start parsing");
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const [page, pageToImages] = await addHTTPheaders(
      browser,
      false,
    );
    await parseAllNovels(page, pageToImages);
  } catch (error) {
    console.error("Parsing Error", error);
  } finally {
    if (browser) {
      browser.close();
      console.log("browser closed");
    }
  }
}
