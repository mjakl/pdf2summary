#!/usr/bin/env bun

const fs = require("fs");
const path = require("path");

const DEFAULT_PROMPT_FILE = "pdf-audio-prompt-template.txt";
const DEFAULT_OUTPUT_FILE = "pdf-audio-bookmarklet.generated.txt";

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  let openUrlArg;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--open-url") {
      const value = argv[i + 1];
      if (value === undefined) {
        fail("Missing value for --open-url.");
      }
      openUrlArg = value.trim();
      i += 1;
      continue;
    }

    if (arg.startsWith("--open-url=")) {
      openUrlArg = arg.slice("--open-url=".length).trim();
      continue;
    }

    if (arg === "--no-open") {
      openUrlArg = "";
      continue;
    }

    if (arg.startsWith("--")) {
      fail(`Unknown option: ${arg}`);
    }

    positional.push(arg);
  }

  if (positional.length > 2) {
    fail(
      "Usage: bun run ./make-pdf-audio-bookmarklet.js [prompt_file] [output_file] [--open-url <url>|--open-url=<url>|--no-open]"
    );
  }

  return {
    promptPathArg: positional[0] || DEFAULT_PROMPT_FILE,
    outputPathArg: positional[1] || DEFAULT_OUTPUT_FILE,
    openUrlArg,
  };
}

const { promptPathArg, outputPathArg, openUrlArg } = parseArgs(
  process.argv.slice(2)
);

const promptPath = path.resolve(process.cwd(), promptPathArg);
const outputPath = path.resolve(process.cwd(), outputPathArg);

if (!fs.existsSync(promptPath)) {
  fail(`Prompt template not found: ${promptPath}`);
}

const template = fs.readFileSync(promptPath, "utf8").replace(/\r\n/g, "\n").trim();

if (!template) {
  fail(`Prompt template is empty: ${promptPath}`);
}

if (!template.includes("{{PDF_URL}}")) {
  console.warn(
    'Warning: template does not contain "{{PDF_URL}}". PDF URL injection will not happen.'
  );
}

let providerOpenUrl = null;
if (openUrlArg !== undefined && openUrlArg.length > 0) {
  let parsedOpenUrl;
  try {
    parsedOpenUrl = new URL(openUrlArg);
  } catch {
    fail(`Invalid --open-url value: ${openUrlArg}`);
  }

  if (!/^https?:$/.test(parsedOpenUrl.protocol)) {
    fail(`--open-url must use http or https: ${openUrlArg}`);
  }

  providerOpenUrl = parsedOpenUrl.toString();
}

const copiedAlertText = providerOpenUrl
  ? "Prompt copied to clipboard. Opening the provider page."
  : "Prompt copied to clipboard.";

const openProviderSnippet = providerOpenUrl
  ? `window.open(${JSON.stringify(providerOpenUrl)},"_blank","noopener");`
  : "";

const bookmarkletBody = `(async()=>{const TEMPLATE=${JSON.stringify(
  template
)};const currentUrl=location.href;const parsedCurrentUrl=(()=>{try{return new URL(currentUrl);}catch{return null;}})();const currentLooksLikePdf=/\\.pdf($|[?#])/i.test(currentUrl)||!!parsedCurrentUrl&&/(^|\\.)arxiv\\.org$/i.test(parsedCurrentUrl.hostname)&&/^\\/pdf\\//i.test(parsedCurrentUrl.pathname);const attachedPdfFallback="Attached PDF uploaded in this chat (no URL provided). Use the uploaded file as the source.";let pdf=currentUrl;if(!currentLooksLikePdf){const enteredUrl=prompt("PDF URL (optional; leave blank to use attached PDF):","");if(enteredUrl===null)return;pdf=enteredUrl.trim()||attachedPdfFallback;}const finalPrompt=TEMPLATE.split("{{PDF_URL}}").join(pdf);try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error("Clipboard API not available");await navigator.clipboard.writeText(finalPrompt);alert(${JSON.stringify(
  copiedAlertText
)});}catch(e){prompt("Copy this prompt:",finalPrompt);}${openProviderSnippet}})();`;

const bookmarklet = `javascript:${bookmarkletBody}`;

fs.writeFileSync(outputPath, `${bookmarklet}\n`, "utf8");

console.log(`Prompt template: ${promptPath}`);
console.log(`Bookmarklet output: ${outputPath}`);
console.log(`Open provider page: ${providerOpenUrl || "(disabled)"}`);
console.log("Done. Copy the full line from the output file into your Chrome bookmark URL field.");
