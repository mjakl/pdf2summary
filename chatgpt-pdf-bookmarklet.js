(async () => {
  const TEMPLATE = `ROLE: You are a technical educator translating academic ML/DL research into practitioner-accessible audio content.

SOURCE PDF: {{PDF_URL}}

AUDIENCE: Engineer with basic calculus/linear algebra (can read PyTorch/TensorFlow code) but limited formal math depth. Needs conceptual bridges between implementation intuition and mathematical formalism.

AUDIO-OPTIMIZATION RULES (Critical):
- Narrative prose ONLY. No bullet points, numbered lists, or hierarchical outlines.
- Mathematical notation: spell out all symbols verbally; no LaTeX.
- Figures & Tables: explain meaning/trends, not layouts/cell dumps.
- Citations: strip bracketed reference numbers.
- Use smooth spoken transitions.

CONTENT STRUCTURE:
Hook, conceptual foundation, methodology in plain terms, results interpretation, engineering takeaway, broader web context and impact.

TARGET LENGTH: ~2,500 words (15-20 min audio).
Create a downloadable PDF.`;

  const currentUrl = location.href;
  const parsedCurrentUrl = (() => {
    try {
      return new URL(currentUrl);
    } catch {
      return null;
    }
  })();

  const currentLooksLikePdf =
    /\.pdf($|[?#])/i.test(currentUrl) ||
    (!!parsedCurrentUrl &&
      /(^|\.)arxiv\.org$/i.test(parsedCurrentUrl.hostname) &&
      /^\/pdf\//i.test(parsedCurrentUrl.pathname));

  const attachedPdfFallback =
    "Attached PDF uploaded in this chat (no URL provided). Use the uploaded file as the source.";

  let pdfUrl = currentUrl;
  if (!currentLooksLikePdf) {
    const enteredUrl = prompt(
      "PDF URL (optional; leave blank to use attached PDF):",
      ""
    );
    if (enteredUrl === null) return;
    pdfUrl = enteredUrl.trim() || attachedPdfFallback;
  }

  const finalPrompt = TEMPLATE.replaceAll("{{PDF_URL}}", pdfUrl);

  try {
    await navigator.clipboard.writeText(finalPrompt);
    alert("Prompt copied to clipboard. Paste into ChatGPT Pro.");
  } catch (e) {
    prompt("Copy this prompt:", finalPrompt);
  }

  window.open("https://chatgpt.com/", "_blank", "noopener");
})();
