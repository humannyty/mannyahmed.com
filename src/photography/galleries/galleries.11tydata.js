// Applies to every file in src/photography/galleries/
export default {
  layout: "layouts/gallery.njk",
  eleventyComputed: {
    kicker: (data) => [data.place, data.page.date && new Date(data.page.date).getUTCFullYear()].filter(Boolean).join(" · "),
    sub: (data) => data.summary,
    permalink: (data) => (data.draft ? false : `/photography/${data.page.fileSlug}/`),
  },
};
