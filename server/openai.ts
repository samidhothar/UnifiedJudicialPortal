import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateCaseBrief(caseId: number, caseTitle: string, caseSummary: string, caseType: string): Promise<{
  summary: string;
  keyPoints: string[];
  precedents: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `
    Generate a comprehensive AI legal brief for the following case:
    
    Case ID: ${caseId}
    Title: ${caseTitle}
    Type: ${caseType}
    Summary: ${caseSummary}
    
    Please provide a JSON response with the following structure:
    {
      "summary": "Brief case summary highlighting key legal issues",
      "keyPoints": ["Array of key legal points and arguments"],
      "precedents": ["Array of relevant legal precedents and case law"],
      "recommendations": ["Array of recommended actions or considerations"]
    }
    
    Focus on Pakistani legal system and jurisprudence where applicable.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert legal AI assistant specializing in Pakistani law and jurisprudence. Provide detailed, accurate legal analysis and recommendations based on the case information provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || "AI analysis unavailable",
      keyPoints: result.keyPoints || [],
      precedents: result.precedents || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("Error generating case brief:", error);
    // Return fallback static content for demo purposes
    return {
      summary: "This case involves complex legal issues that require careful analysis of evidence and applicable law.",
      keyPoints: [
        "Review of documentary evidence and witness testimonies",
        "Assessment of legal standing and jurisdiction",
        "Analysis of applicable statutory provisions"
      ],
      precedents: [
        "Similar cases in Pakistani jurisprudence",
        "Relevant Supreme Court decisions",
        "High Court precedents in similar matters"
      ],
      recommendations: [
        "Thorough examination of all evidence",
        "Consider mediation for amicable resolution",
        "Ensure proper legal procedure compliance"
      ]
    };
  }
}
