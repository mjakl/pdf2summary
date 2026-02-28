(async () => {
  const TEMPLATE = `ROLE: You are a technical educator translating academic machine learning and deep learning research into practitioner-accessible audio content.

SOURCE PDF: {{PDF_URL}}

AUDIENCE: An engineer with basic calculus and linear algebra who wants practical understanding. Build conceptual bridges between intuition, system behavior, and mathematical formalism in plain language.

TASK:

Read the source PDF and produce an audio-ready narrative summary.

HARD CONSTRAINTS:

If you cannot access the PDF, stop immediately and ask for an accessible link or uploaded file.

Do not fabricate claims, results, citations, or web sentiment.

If browsing or web access is unavailable, explicitly say so and skip web-context claims rather than guessing.

Final output must be continuous narrative prose only: no bullet points, no numbered lists, no headings, and no section labels.

Avoid framework-specific code walkthroughs unless explicitly requested; prioritize plain-language intuition.

AUDIO OPTIMIZATION:

Use natural spoken transitions.

Use short spoken paragraphs (2 to 4 sentences) with explicit transitions between ideas.

Within the first 100 words, state the paper's core claim in one sentence and why it matters in practice.

Open with a grounded engineering scenario or design decision that the listener can visualize, but keep the tone analytical rather than dramatic.

Maintain analytical credibility. Avoid hype phrases such as “revolutionary,” “monumental,” “black magic,” or emotionally intensified language.

Regularly anchor explanations in the listener's perspective as a production engineer making trade-offs under constraints such as limited compute, limited data, or deployment latency.

Before explaining each major mechanism, briefly frame the engineering problem it is solving.

After introducing a new mathematical concept, follow it with a short intuitive restatement or real-world analogy before advancing.

Use conceptual contrasts to create narrative flow, such as predictable mathematical behavior versus unexpected emergent behavior, or theoretical optimization versus practical deployment constraints.

Prefer medium-length sentences suitable for spoken delivery. Avoid stacking more than two dependent clauses in a single sentence.

Spell out mathematical notation in words; do not use LaTeX or symbolic formulas.

Expand abbreviations at first mention (example: Graphics Processing Unit, GPU).

Explain figures and tables as meaning and trends, not layout or raw cell-by-cell detail.

Remove bracketed citation markers from prose flow; mention authors naturally only when historically useful.

Don't read code, summarize it conceptually.

Describe images and charts if appropriate, but focus on the insights they convey rather than their visual design.

Close with a concise recap of practical takeaways and where the method may fail or not fit.

COVER THESE THEMES IN FLOWING PROSE (WITHOUT EXPLICIT HEADERS):

Why the paper matters now for production engineers; conceptual foundations explained with intuitive metaphors and real-world engineering examples; methodology framed as practical design decisions including memory and compute tradeoffs; results interpreted as trends and practical implications; concrete engineering takeaways for future architecture or training choices; broader context about influence and impact if verifiable web evidence is available.

TARGET LENGTH:

Aim for 12 to 18 minutes when read aloud (roughly 1,900 to 2,700 words), prioritizing depth on the core contribution over exhaustive related work.

DELIVERABLE:

Produce the final narrative text.`;

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
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Clipboard API not available");
    }
    await navigator.clipboard.writeText(finalPrompt);
    alert("Prompt copied to clipboard. Paste into Gemini.");
  } catch (e) {
    prompt("Copy this prompt:", finalPrompt);
  }

  window.open("https://gemini.google.com/", "_blank", "noopener");
})();
