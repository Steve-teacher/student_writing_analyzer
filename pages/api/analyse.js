import Anthropic from "@anthropic-ai/sdk";

export const config = { api: { bodyParser: { sizeLimit: "20mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: "No PDF data provided" });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            {
              type: "text",
              text: `This PDF contains handwritten student writing samples. For EACH student page, extract and assess:

1. student_name: The name written at the top of the page
2. written_text: Full transcription of their handwritten text
3. spelling_score: Integer 1–5 based on spelling accuracy (5=near perfect, 4=minor errors, 3=several errors, 2=many errors, 1=significant errors)
4. observations: 1–2 sentence observation about writing quality, content, or development
5. ccss_assessment: Assessment against Common Core State Standards for ELA Grades 6–8:
   - ccss_level: One of "Approaching", "Meeting", or "Exceeding" grade-band expectations
   - standards_met: Array of up to 3 specific CCSS standards demonstrated, each with:
       - code: e.g. "W.6.3", "W.7.4", "L.6.2"
       - note: 1 brief sentence explaining what the student did
   - areas_for_growth: Array of up to 2 standards not yet met, each with:
       - code: e.g. "W.6.1b", "L.6.3"
       - note: 1 brief sentence explaining what is missing

Relevant CCSS ELA strands: Writing (W.6–8): narrative, informative, argument, organization, development, style. Language (L.6–8): conventions, grammar, vocabulary, sentence variety.

Respond ONLY with a valid JSON array. No markdown, no preamble.`,
            },
          ],
        },
      ],
    });

    const raw = response.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const students = JSON.parse(clean);
    return res.status(200).json({ students });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || "Analysis failed" });
  }
}
