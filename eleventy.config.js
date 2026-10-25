import yaml from "js-yaml";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, typographer: true });

export default function (eleventyConfig) {
  // YAML data files (src/_data/*.yml) so they're easy to edit by hand or in Pages CMS
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Every <img> pointing at a local file gets resized into WebP/JPEG at several
  // widths with a responsive srcset. Metadata (EXIF, including GPS) is stripped.
  // Originals in src/media are NOT published, only the generated sizes.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"], // AVIF is smaller but slow to encode for big collections
    widths: [480, 960, 1600, 2400],
    outputDir: "_site/img/",
    urlPath: "/img/",
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
        sizes: "(max-width: 760px) 100vw, 60vw",
      },
    },
  });

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets"); // pre-rendered artwork, see scripts/render-art.mjs
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy({ "src/media/files": "files" }); // PDFs etc., not photos

  // Collections
  const byDateDesc = (a, b) => b.date - a.date;
  eleventyConfig.addCollection("writing", (api) =>
    api.getFilteredByGlob("src/writing/posts/*.md").filter((p) => !p.data.draft).sort(byDateDesc)
  );
  eleventyConfig.addCollection("galleries", (api) =>
    api.getFilteredByGlob("src/photography/galleries/*.md").filter((p) => !p.data.draft).sort(byDateDesc)
  );
  // Photos for the homepage: any photo marked "featured", newest galleries first;
  // if none are featured, the first photos of the newest galleries.
  eleventyConfig.addCollection("homePhotos", (api) => {
    const galleries = api
      .getFilteredByGlob("src/photography/galleries/*.md")
      .filter((p) => !p.data.draft)
      .sort(byDateDesc);
    const all = galleries.flatMap((g) =>
      (g.data.photos || [])
        .filter((ph) => ph && ph.image)
        .map((ph) => ({ ...ph, gallery: g }))
    );
    const featured = all.filter((ph) => ph.featured);
    return (featured.length ? featured : all).slice(0, 6);
  });

  // Filters
  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("year", (d) => (d ? new Date(d).getUTCFullYear() : ""));
  eleventyConfig.addFilter("readableDate", (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      : ""
  );
  eleventyConfig.addFilter("isoDate", (d) => (d ? new Date(d).toISOString().slice(0, 10) : ""));
  eleventyConfig.addFilter("withUrl", (items) => (items || []).filter((i) => i && i.url));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("byDateDesc", (arr) =>
    [...(arr || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false, // so stray {{ }} in a post never breaks the build
    htmlTemplateEngine: "njk",
  };
}
