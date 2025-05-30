import { downloadImageForS3 } from "@/shared/lib/download_image_for_S3";
import { transliterateToUrl } from "@/shared/lib/transliterate";
import { Page } from "playwright";
import { createTags } from "../seed/create_tags";

export async function parseSingleNovell({
  page,
  pageToImages,
  novell_url,
}: {
  page: Page;
  pageToImages: Page;
  novell_url: string;
}) {
  const tarsnslated_url = `${novell_url.replace(/www.69shuba.com/g, "www-69shuba-com.translate.goog")}?_x_tr_sl=zh-CN&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=wapp`;
  await page.goto(tarsnslated_url);
  await page.waitForSelector(".bookbox", {
    state: "visible",
    timeout: 60000,
  });
  const novell = await page
    .locator("div.bookbox")
    .evaluateAll((e) => {
      return e.map((el) => {
        return {
          novell_genre: `${el
            .querySelectorAll("div.booknav2 > p > a")[1]
            .textContent?.trim()}`,
        };
      });
    });
  const novell_title_ru = await page
    .locator("h1")
    .innerText();
  const tags = await page
    .locator("ul.tagul > a")
    .evaluateAll((e) => {
      return e.map((el) => {
        return el.textContent?.trim() || "";
      });
    });
  const parsed_tags = tags.map((e) => {
    return e.toLowerCase().replace(/поток/gi, "").trim();
  });
  const novell_description = await page
    .locator("div.navtxt")
    .innerText();

  const url_to_all_chapters = (await page
    .locator("a.more-btn")
    .getAttribute("href")) as string;
  const img_url = (await page
    .locator("div.bookimg2 > img")
    .getAttribute("src")) as string;

  await createTags(parsed_tags);
  const slug = transliterateToUrl(novell_title_ru);

  const image_path = await downloadImageForS3(
    img_url,
    slug,
    "novell_image",
    {
      page: pageToImages,
      convert_to_png: false,
      remove_wattermark: true,
      proxy_tor: true,
      incriase: true,
      textDelete: true,
    },
  );

  return {
    genre: novell[0].novell_genre,
    tags: parsed_tags,
    title: novell_title_ru,
    novell_description: novell_description,
    url_to_all_chapters,
    slug: slug,
    image_path: image_path as string,
  };
}
