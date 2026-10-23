// Applies to every file in src/writing/posts/
export default {
  layout: "layouts/post.njk",
  kind: "Essay",
  eleventyComputed: {
    kicker: (data) => [data.kind, data.page.date && new Date(data.page.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })].filter(Boolean).join(" · "),
    sub: (data) => data.summary,
    // Drafts are kept in the repo but never published.
    permalink: (data) => (data.draft ? false : `/writing/${data.page.fileSlug}/`),
  },
};
