# pawling-masonry

A Scribe website. Built with [Astro](https://astro.build), deployed to GitHub
Pages, with Scribe as its backend for content and form submissions.

## Getting started

```
npm install
npm run dev
```

This repo is deliberately close to empty. **There is no template to fill in** —
design the site however the work calls for, and read `.scribe.yml` for the
collections, the fields, the form collections and this Site's analytics id.

## How to build it

Ask Claude Code, which has the `scribe-site-builder` skill and the recipes it
points at:

| Recipe | For |
|---|---|
| `recipes/schema.md` | reading `.scribe.yml`, rendering content, the analytics tracker |
| `recipes/collections.md` | Astro content collections from the schema |
| `recipes/forms.md` | a form that posts to Scribe, with Turnstile and the retry queue |
| `recipes/deploy.md` | the build, the base path, the deploy workflow |

## Five things that are contract, not preference

Each one fails **silently** — nothing errors, the build goes green, and the page
looks right to whoever just deployed it. Two of them destroy information that
cannot be recovered afterwards.

1. **The analytics tracker is on every page.** `.scribe.yml` carries
   `umamiWebsiteId` and `umamiScriptUrl`; nothing renders them for you. A month
   shipped without it is a month that stays empty forever.
2. **Any form that posts to Scribe loads Turnstile**, with *this* Site's
   `turnstileSiteKey`. The endpoint 401s a submission without a token.
3. **Any form that posts to Scribe has the retry queue**, and declares it with
   `data-scribe-retry`. Without it a Visitor can be told their enquiry sent when
   it did not.
4. **The deploy workflow keeps `workflow_dispatch`.** Scribe dispatches it when
   an editor publishes; without it the admin says saved and the site never
   updates.
5. **Astro's `base` follows `public/CNAME`**, which the workflow already does.

Forms are optional. If this Site has no form, 2 and 3 do not apply.

Check all five against what is actually deployed:

```
scribe site deploy pawling-masonry      # deploy, wait for it, then verify
scribe site verify pawling-masonry      # just verify whatever is live now
```
