# Through the Waters: Baptism in Salvation History

A virtual museum exhibition on Baptism and salvation history, built for an 11th-grade Catholic theology course.

**Live site:** https://through-the-waters.pages.dev

## The exhibition

Nine slides, each introducing something the others do not:

| Slide | Contribution |
|---|---|
| Introduction | Thesis and CCC 1262 |
| How to Read a Shadow | Type / antitype defined |
| Creation & the Spirit Over the Waters | Life |
| Noah's Ark & the Great Flood | Judgment and renewal |
| The Crossing of the Red Sea | Liberation |
| Crossing the Jordan River | Inheritance |
| Christ Fulfills the Signs | The antitype, plus the Trinitarian theophany |
| What Actually Happens | The five graces of Baptism (CCC 1262–1274) |
| Reading Sacred Art | Five-lens analysis panel |

Plus a Sources section with full museum credits.

## How it is built

Three static files, no build step and no dependencies:

- `index.html` — all section markup
- `styles.css` — dark navy / cream / gold palette, Cormorant Garamond + Inter
- `app.js` — artwork catalogue, the grace accordion, the artwork analysis panel, the lightbox, and scroll behavior

Artwork images are **not** committed. They are resolved at page load from the
[Wikimedia Commons API](https://commons.wikimedia.org/w/api.php) by exact file title, with a
keyword search as a fallback, so the site always renders the current public-domain master file.
Every artwork carries a museum plaque linking to its Commons record.

`public/` holds the deployed copy of the three files. Edit the files at the repository root, then copy
them into `public/` before deploying.

## Local preview

```
npx serve -l 4173 .
```

## Deploy

```
npx wrangler pages deploy public --project-name=through-the-waters --branch=main --commit-dirty=true
```

If wrangler reports `Invalid access token [code: 9109]`, an expired `CLOUDFLARE_API_TOKEN`
environment variable is shadowing the stored OAuth login. Prefix the command with
`env -u CLOUDFLARE_API_TOKEN`.

## Sources

- Scripture: *Revised Standard Version, Catholic Edition* (Ignatius Press, 1966)
- *Catechism of the Catholic Church*, 2nd ed. — CCC 128–130, 1217–1224, 1262–1274
- Artworks: public domain, via Wikimedia Commons (Michelangelo, Rosselli, workshop of Raphael,
  Verrocchio & Leonardo, and Jan Brueghel the Elder)
