# pdf2summary

Create a one-click bookmarklet that prepares your paper-summary prompt, copies it to your clipboard, and (optionally) opens your LLM chat page.

This project is intentionally small and practical: it helps you apply **your own lens** to research papers instead of relying on someone else’s summary style.

## Why this exists

Reading papers directly is one of the best ways to stay current.

There are great newsletters and websites that summarize research, but every summary is shaped by the author’s assumptions, priorities, and audience. With modern LLMs, you can keep the source material and apply your own lens: your background, your goals, your level of math comfort, and your preferred output style.

That is exactly what this repo is for.

## What this project does (and does not do)

### It does

- keep a reusable prompt template for paper summaries
- inject the current PDF URL into that template
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

- [Bun](https://bun.sh/)
- [just](https://github.com/casey/just) (optional, but recommended)

### 1) Customize the prompt

Edit:

- `pdf2summary-prompt-template.txt`

Important: keep `{{PDF_URL}}` in the template. That placeholder is replaced automatically by the bookmarklet.

### 2) Generate the bookmarklet

Using `just`:

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

## Prompt customization guide

The template is the core of this repo. Make it yours.

Good knobs to tune:

- **Audience level**: beginner/intermediate/advanced
- **Math depth**: intuition-first vs derivation-heavy
- **Length**: shorter briefing vs deep long-form summary
- **Focus**: architecture, optimization, data, evaluation, deployment trade-offs
- **Output style**: narrative prose, concise memo, implementation checklist, etc.

A useful workflow is to run 3–5 papers, then refine the template based on what felt too shallow, too dense, too verbose, or not actionable enough.

## Provider page opening behavior

By default, generated bookmarklets **do not open any page** after copying.

You can opt in when generating:

```bash
just generate open_url="https://gemini.google.com/u/1/app"
```

Or via direct script usage:

```bash
bun run ./make-pdf2summary-bookmarklet.js --open-url "https://gemini.google.com/u/1/app"
```

Disable opening explicitly:

```bash
bun run ./make-pdf2summary-bookmarklet.js --no-open
```

### Environment variable fallback

If `PDF2SUMMARY_OPEN_URL` is set, the generator uses it automatically (unless `--no-open` is provided).

Example `.envrc`:

```bash
export PDF2SUMMARY_OPEN_URL="https://gemini.google.com/u/1/app"
```

Then allow it (if you use direnv):

```bash
direnv allow
```

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

1. Open a paper PDF page (ArXiv PDF pages work well).
2. Click the `pdf2summary` bookmarklet.
3. If you are not currently on a PDF URL, enter one when prompted.
4. The final prompt is copied to your clipboard.
5. Paste into your LLM chat and run.

## Listening options and alternatives

Once the summary is generated, you can listen to it with:

- Readwise Reader (text-to-speech)
- built-in text-to-speech in your LLM provider

If you prefer a more automated workflow and do not want this semi-manual setup, check out **Paper2Audio**.

## Papers to test with

- **Adam: A Method for Stochastic Optimization**  
  https://arxiv.org/pdf/1412.6980.pdf

- **Dropout: A Simple Way to Prevent Neural Networks from Overfitting**  
  https://arxiv.org/pdf/1207.0580.pdf

- **LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale**  
  https://arxiv.org/pdf/2208.07339.pdf

## Repository files

- `pdf2summary-prompt-template.txt` — prompt template you customize
- `make-pdf2summary-bookmarklet.js` — generator script
- `pdf2summary-bookmarklet.generated.txt` — generated bookmarklet URL
- `pdf2summary-bookmarklet.js` — readable bookmarklet source variant
- `justfile` — task shortcuts (`generate`, `copy`, `build-and-copy`)

## License

MIT. See [LICENSE](./LICENSE).
