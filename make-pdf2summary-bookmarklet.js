#!/usr/bin/env bun

const fs = require("fs");
const path = require("path");

const DEFAULT_PROMPT_FILE = "pdf2summary-prompt-template.txt";
const DEFAULT_OUTPUT_FILE = "pdf2summary-bookmarklet.generated.txt";
const OPEN_URL_ENV_VAR = "PDF2SUMMARY_OPEN_URL";

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  let openUrlArg;
  let explicitNoOpen = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--open-url") {
      const value = argv[i + 1];
      if (value === undefined) {
        fail("Missing value for --open-url.");
      }
      openUrlArg = value.trim();
      explicitNoOpen = false;
      i += 1;
      continue;
    }

    if (arg.startsWith("--open-url=")) {
      openUrlArg = arg.slice("--open-url=".length).trim();
      explicitNoOpen = false;
      continue;
    }

    if (arg === "--no-open") {
      explicitNoOpen = true;
      openUrlArg = undefined;
      continue;
    }

    if (arg.startsWith("--")) {
      fail(`Unknown option: ${arg}`);
    }

    positional.push(arg);
  }

  if (positional.length > 2) {
    fail(
      "Usage: bun run ./make-pdf2summary-bookmarklet.js [prompt_file] [output_file] [--open-url <url>|--open-url=<url>|--no-open]"
    );
  }

  return {
    promptPathArg: positional[0] || DEFAULT_PROMPT_FILE,
    outputPathArg: positional[1] || DEFAULT_OUTPUT_FILE,
    openUrlArg,
    explicitNoOpen,
  };
}

function resolveOpenUrl(openUrlArg, explicitNoOpen) {
  if (explicitNoOpen) {
    return { providerOpenUrl: null, source: null };
  }

  const envOpenUrl = (process.env[OPEN_URL_ENV_VAR] || "").trim();
  const candidate = openUrlArg !== undefined ? openUrlArg : envOpenUrl;

  if (!candidate) {
    return { providerOpenUrl: null, source: null };
  }

  let parsedOpenUrl;
  try {
    parsedOpenUrl = new URL(candidate);
  } catch {
    if (openUrlArg !== undefined) {
      fail(`Invalid --open-url value: ${candidate}`);
    }
    fail(`Invalid ${OPEN_URL_ENV_VAR} value: ${candidate}`);
  }

  if (!/^https?:$/.test(parsedOpenUrl.protocol)) {
    if (openUrlArg !== undefined) {
      fail(`--open-url must use http or https: ${candidate}`);
    }
    fail(`${OPEN_URL_ENV_VAR} must use http or https: ${candidate}`);
  }

  return {
    providerOpenUrl: parsedOpenUrl.toString(),
    source: openUrlArg !== undefined ? "--open-url" : OPEN_URL_ENV_VAR,
  };
}

const { promptPathArg, outputPathArg, openUrlArg, explicitNoOpen } = parseArgs(
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

const hasSourcePlaceholder = template.includes("{{SOURCE_URL}}");
const hasLegacyPdfPlaceholder = template.includes("{{PDF_URL}}");

if (!hasSourcePlaceholder && !hasLegacyPdfPlaceholder) {
  console.warn(
    'Warning: template does not contain "{{SOURCE_URL}}" (or legacy "{{PDF_URL}}"). Source URL injection will not happen.'
  );
} else if (!hasSourcePlaceholder && hasLegacyPdfPlaceholder) {
  console.warn(
    'Warning: template uses legacy "{{PDF_URL}}" placeholder. Prefer "{{SOURCE_URL}}" for new templates.'
  );
}

const { providerOpenUrl, source: openUrlSource } = resolveOpenUrl(
  openUrlArg,
  explicitNoOpen
);

const copiedAlertText = providerOpenUrl
  ? "Prompt copied to clipboard. Opening the provider page."
  : "Prompt copied to clipboard.";

const openProviderSnippet = providerOpenUrl
  ? `window.open(${JSON.stringify(providerOpenUrl)},"_blank","noopener");`
  : "";

const bookmarkletBody = `(async()=>{const TEMPLATE=${JSON.stringify(
  template
)};const currentUrl=location.href;const parsedCurrentUrl=(()=>{try{return new URL(currentUrl);}catch{return null;}})();const currentIsHttpUrl=!!parsedCurrentUrl&&/^https?:$/.test(parsedCurrentUrl.protocol);const attachedSourceFallback="Attached source document uploaded in this chat (no URL provided). Use the uploaded file as the source.";let source=currentUrl;if(!currentIsHttpUrl){const enteredUrl=prompt("Source URL (optional; leave blank to use an uploaded source):","");if(enteredUrl===null)return;source=enteredUrl.trim()||attachedSourceFallback;}const finalPrompt=TEMPLATE.split("{{SOURCE_URL}}").join(source).split("{{PDF_URL}}").join(source);try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error("Clipboard API not available");await navigator.clipboard.writeText(finalPrompt);alert(${JSON.stringify(
  copiedAlertText
)});}catch(e){prompt("Copy this prompt:",finalPrompt);}${openProviderSnippet}})();`;

const bookmarklet = `javascript:${bookmarkletBody}`;

fs.writeFileSync(outputPath, `${bookmarklet}\n`, "utf8");

console.log(`Prompt template: ${promptPath}`);
console.log(`Bookmarklet output: ${outputPath}`);
if (providerOpenUrl) {
  console.log(`Open provider page: ${providerOpenUrl} (source: ${openUrlSource})`);
} else {
  console.log("Open provider page: (disabled)");
}
console.log("Done. Copy the full line from the output file into your Chrome bookmark URL field.");
