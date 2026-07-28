export default function parseAIReport(markdown) {
  if (!markdown) return {};

  const extractSection = (title, nextTitles = []) => {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nextPattern = nextTitles.length
      ? nextTitles
          .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")
      : "$";

    const regex = new RegExp(
      `##\\s*${escapedTitle}\\s*([\\s\\S]*?)(?=##\\s*(?:${nextPattern})|$)`,
      "i"
    );

    const match = markdown.match(regex);

    return match ? match[1].trim() : "";
  };

  const scoreMatch = markdown.match(
    /Score:\s*\*\*(\d+)\s*\/\s*100/i
  );

  const riskMatch = markdown.match(
    /\((.*?)Risk\)/i
  );

  return {
    score: scoreMatch ? Number(scoreMatch[1]) : null,

    risk: riskMatch
      ? riskMatch[1] + " Risk"
      : "",

    executiveSummary: extractSection(
      "1. Executive Summary",
      [
        "2. Overall Security Score",
      ]
    ),

    overallScore: extractSection(
      "2. Overall Security Score",
      [
        "3. Critical Vulnerabilities",
      ]
    ),

    critical: extractSection(
      "3. Critical Vulnerabilities",
      [
        "4. High Vulnerabilities Summary",
      ]
    ),

    fixes: extractSection(
      "6. Immediate Fixes",
      [
        "7. DevSecOps Best Practices",
      ]
    ),

    bestPractices: extractSection(
      "7. DevSecOps Best Practices",
      []
    ),
  };
}
