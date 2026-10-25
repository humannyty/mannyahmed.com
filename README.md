# mannyahmed.com

Personal site, built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages by GitHub Actions.

## Editing

**In the browser:** log in at [app.pagescms.org](https://app.pagescms.org) with GitHub and open this repo. You get editors for writing, photo galleries, social posts, homepage text, papers and site settings. Saving commits to `main`, and the site rebuilds in a minute or two.

**By hand:**

| What | Where |
| --- | --- |
| Blog posts, essays, stories, poems | `src/writing/posts/YYYY-MM-DD-slug.md` |
| Photo galleries | `src/photography/galleries/slug.md` |
| Photo files | `src/media/photos/` |
| Links to social posts | `src/_data/elsewhere.yml` |
| Social profiles, email | `src/_data/site.yml` |
| Homepage text | `src/_data/home.yml` |
| Papers | `src/_data/research.yml` |
| Design | `src/css/site.css`, `src/_includes/` |

Set `draft: true` in a post or gallery to keep it out of the site.

## Photos

Upload photos at roughly web size (around 2,500 px on the long edge). The build makes WebP and JPEG copies at 480–2400 px with a responsive `srcset`, and strips metadata, including GPS location. Only those resized copies are published, not the files in `src/media/photos/`. They're still in the public repo though, so strip location data before uploading anything you'd rather not share.

On the homepage, the Photography section shows photos marked "Show on homepage". If none are marked, it shows the first photos of the newest galleries.

## Background artwork

The watercolour scenes behind the homepage header, page headers and contact section are drawn in `art/*.svg`, but the site shows pre-rendered images of them from `src/assets/`. Running those SVG filters live across a whole screen makes iPhone Safari show a blank page. If you edit anything in `art/`, re-render the images:

```sh
npm install --no-save playwright && npx playwright install webkit
node scripts/render-art.mjs
```

## Running locally

```sh
npm install
npm start        # http://localhost:8080
```
