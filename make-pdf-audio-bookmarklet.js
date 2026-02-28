#!/usr/bin/env bun

const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const promptPathArg = process.argv[2] || "pdf-audio-prompt-template.txt";
const outputPathArg = process.argv[3] || "pdf-audio-bookmarklet.generated.txt";

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

const bookmarkletBody = `(async()=>{const TEMPLATE=${JSON.stringify(
  template
)};const currentUrl=location.href;const parsedCurrentUrl=(()=>{try{return new URL(currentUrl);}catch{return null;}})();const currentLooksLikePdf=/\\.pdf($|[?#])/i.test(currentUrl)||!!parsedCurrentUrl&&/(^|\\.)arxiv\\.org$/i.test(parsedCurrentUrl.hostname)&&/^\\/pdf\\//i.test(parsedCurrentUrl.pathname);const attachedPdfFallback="Attached PDF uploaded in this chat (no URL provided). Use the uploaded file as the source.";let pdf=currentUrl;if(!currentLooksLikePdf){const enteredUrl=prompt("PDF URL (optional; leave blank to use attached PDF):","");if(enteredUrl===null)return;pdf=enteredUrl.trim()||attachedPdfFallback;}const finalPrompt=TEMPLATE.split("{{PDF_URL}}").join(pdf);try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error("Clipboard API not available");await navigator.clipboard.writeText(finalPrompt);alert("Prompt copied to clipboard. Paste into Gemini.");}catch(e){prompt("Copy this prompt:",finalPrompt);}window.open("https://gemini.google.com/","_blank","noopener");})();`;

const bookmarklet = `javascript:${bookmarkletBody}`;

fs.writeFileSync(outputPath, `${bookmarklet}\n`, "utf8");

console.log(`Prompt template: ${promptPath}`);
console.log(`Bookmarklet output: ${outputPath}`);
console.log("Done. Copy the full line from the output file into your Chrome bookmark URL field.");
