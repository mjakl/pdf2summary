# pdf2summary

Create a one-click bookmarklet that prepares your summary prompt, copies it to your clipboard, and (optionally) opens your LLM chat page.

This project is intentionally small and practical: it helps you apply **your own lens** to technical sources instead of relying on someone else’s summary style.

## Why this exists

Reading primary sources directly is one of the best ways to stay current.

There are great newsletters and websites that summarize research, but every summary is shaped by the author’s assumptions, priorities, and audience. With modern LLMs, you can keep the source material and apply your own lens: your background, your goals, your level of math comfort, and your preferred output style.

That is exactly what this repo is for.

## What this project does (and does not do)

### It does

- keep a reusable prompt template for technical summaries
- inject the current source URL into that template (PDF, HTML article, docs page, etc.)
- generate a bookmarklet JavaScript URL you can save in your browser
- copy the final prompt to clipboard when you click the bookmarklet
- optionally open your LLM provider page after copying

### It does not

- force a specific model/provider
- perform the summary itself
- convert to audio (that step is intentionally separate)

## LLM choice

Use any LLM you like. In my own tests, Gemini 3.x produced the smoothest narrative summaries for this workflow, but this setup is provider-agnostic.

## Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) **or** [Bun](https://bun.sh/)
- [just](https://github.com/casey/just) (optional; current shortcut recipes use Bun)

### 1) Customize the prompt

Edit:

- `pdf2summary-prompt-template.txt`

Important: keep `{{SOURCE_URL}}` in the template. That placeholder is replaced automatically by the bookmarklet.

> Backward compatibility: `{{PDF_URL}}` is still supported, but `{{SOURCE_URL}}` is the recommended placeholder going forward.

### 2) Generate the bookmarklet

Using `just` (with Bun installed):

```bash
just generate
```

This creates:

- `pdf2summary-bookmarklet.generated.txt`

Copy to clipboard:

```bash
just copy
```

Generate + copy in one command:

```bash
just build-and-copy
```

If you prefer to run the generator directly (without `just`), it works with both Node and Bun:

```bash
# Node
node ./make-pdf2summary-bookmarklet.js

# Bun
bun run ./make-pdf2summary-bookmarklet.js
```

## Prompt customization guide

The template is the core of this repo. Make it yours.

Good knobs to tune:

- **Audience level**: beginner/intermediate/advanced
- **Math depth**: intuition-first vs derivation-heavy
- **Length**: shorter briefing vs deep long-form summary
- **Focus**: architecture, optimization, data, evaluation, deployment trade-offs
- **Output style**: narrative prose, concise memo, implementation checklist, etc.

A useful workflow is to run 3–5 sources, then refine the template based on what felt too shallow, too dense, too verbose, or not actionable enough.

## Provider page opening behavior

By default, generated bookmarklets **do not open any page** after copying.

You can opt in when generating:

```bash
just generate open_url="https://gemini.google.com/u/1/app"
```

Or via direct script usage (Node example; same flags work with Bun):

```bash
node ./make-pdf2summary-bookmarklet.js --open-url "https://gemini.google.com/u/1/app"
```

Disable opening explicitly:

```bash
node ./make-pdf2summary-bookmarklet.js --no-open
```

### Environment variable fallback

If `PDF2SUMMARY_OPEN_URL` is set, the generator uses it automatically (unless `--no-open` is provided).

This is the most convenient way to keep your preferred provider URL out of commands. In practice, this pairs nicely with [direnv](https://direnv.net/) or [mise](https://mise.jdx.dev/) so the value is loaded automatically per project.

Example `.envrc`:

```bash
export PDF2SUMMARY_OPEN_URL="https://gemini.google.com/u/1/app"
```

If you use direnv, allow it once in the repo:

```bash
direnv allow
```

If you use mise, load the same variable via your preferred mise environment setup.

## How to install a bookmarklet

1. Generate the bookmarklet file (`just generate`).
2. Open your browser bookmarks manager (or bookmark bar).
3. Create a new bookmark.
4. Set a name, for example: `pdf2summary`.
5. Open `pdf2summary-bookmarklet.generated.txt` and copy the full single line starting with `javascript:`.
6. Paste that full line into the bookmark’s URL/location field.
7. Save.

Tip: keep bookmarks bar visible while testing.

## How to use it

1. Open any source page you want summarized (PDF, HTML article, docs page, etc.).
2. Click the `pdf2summary` bookmarklet.
3. If the current tab is not a standard `http(s)` page, enter a source URL when prompted (or leave blank to reference an uploaded source file).
4. The final prompt is copied to your clipboard.
5. Paste into your LLM chat and run.

## Listening options and alternatives

Once the summary is generated, you can listen to it with:

- [Paper2Audio](https://www.paper2audio.com/) (also supports summarization out of the box)
- [Readwise Reader (text-to-speech)](https://read.readwise.io/)
- built-in text-to-speech in your LLM provider

## Sources to test with

- **Adam: A Method for Stochastic Optimization**  
  https://arxiv.org/pdf/1412.6980.pdf

- **Dropout: A Simple Way to Prevent Neural Networks from Overfitting**  
  https://arxiv.org/pdf/1207.0580.pdf

- **The Illustrated Transformer** (HTML article)  
  https://jalammar.github.io/illustrated-transformer/

## Repository files

- `pdf2summary-prompt-template.txt` — prompt template you customize
- `make-pdf2summary-bookmarklet.js` — generator script
- `pdf2summary-bookmarklet.generated.txt` — generated bookmarklet URL
- `pdf2summary-bookmarklet.js` — readable bookmarklet source variant
- `justfile` — task shortcuts (`generate`, `copy`, `build-and-copy`)

## License

MIT.
