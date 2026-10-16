import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

type ViolationType =
  | "profanity"
  | "sexual"
  | "hate"
  | "harassment"
  | "violence"
  | "self-harm"
  | "fair-housing";

type Violation = {
  type: ViolationType;
  label: string;
  detail: string;
};

type ModerationResult = {
  allowed: boolean;
  violations: Violation[];
};

const FAIR_HOUSING_PATTERNS: { pattern: RegExp; detail: string }[] = [
  {
    pattern:
      /\b(perfect|ideal|great)\s+(for|neighborhood for)\s+(families|singles|couples|young\s+(professionals|couples)|elderly|seniors|retirees|christians|muslims|jews)\b/i,
    detail: "Targeting specific demographic groups",
  },
  {
    pattern:
      /\b(family[\s-]friendly|family\s+neighborhood|family\s+oriented|family\s+community)\b/i,
    detail: "Familial status preference (Fair Housing Act)",
  },
  {
    pattern:
      /\b(no\s+children|adults[\s-]only|no\s+kids|child[\s-]free|mature\s+community)\b/i,
    detail: "Familial status discrimination",
  },
  {
    pattern:
      /\b(walking\s+distance\s+to\s+(church|mosque|synagogue|temple))\b/i,
    detail: "Religious preference in property description",
  },
  {
    pattern:
      /\b(exclusive\s+(community|neighborhood|area)|private\s+community)\b/i,
    detail: "Potentially exclusionary language",
  },
  {
    pattern: /\b(no\s+(section\s*8|vouchers|housing\s+assistance))\b/i,
    detail: "Source of income discrimination",
  },
  {
    pattern:
      /\b(able[\s-]bodied|no\s+(wheelchairs|disabilities|handicap))\b/i,
    detail: "Disability discrimination",
  },
  {
    pattern:
      /\b(english[\s-]speaking\s+(only|preferred|required|tenants|buyers))\b/i,
    detail: "National origin discrimination",
  },
  {
    pattern:
      /\b(bachelor\s+pad|man\s+cave|she[\s-]shed|master\s+bedroom)\b/i,
    detail: "Gender-biased language in property description",
  },
  {
    pattern:
      /\b(safe\s+neighborhood|low[\s-]crime\s+area|dangerous\s+area|bad\s+neighborhood|sketchy\s+area)\b/i,
    detail: "Racial steering language",
  },
  {
    pattern:
      /\b(ethnic|hispanic\s+neighborhood|black\s+neighborhood|white\s+neighborhood|asian\s+community)\b/i,
    detail: "Race/ethnicity-based neighborhood characterization",
  },
  {
    pattern: /\b(no\s+(pets|dogs|cats|animals)\s+allowed)\b/i,
    detail: "May conflict with service/assistance animal requirements",
  },
];

function checkFairHousing(text: string): Violation[] {
  const violations: Violation[] = [];

  for (const { pattern, detail } of FAIR_HOUSING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        type: "fair-housing",
        label: "Fair Housing Violation",
        detail: `${detail} — "${match[0]}"`,
      });
    }
  }

  return violations;
}

const OPENAI_CATEGORY_MAP: Record<
  string,
  { type: ViolationType; label: string }
> = {
  sexual: { type: "sexual", label: "Sexual Content" },
  "sexual/minors": { type: "sexual", label: "Sexual Content (Minors)" },
  hate: { type: "hate", label: "Hate Speech" },
  "hate/threatening": { type: "hate", label: "Hate Speech (Threatening)" },
  harassment: { type: "harassment", label: "Harassment" },
  "harassment/threatening": {
    type: "harassment",
    label: "Harassment (Threatening)",
  },
  violence: { type: "violence", label: "Violence" },
  "violence/graphic": { type: "violence", label: "Graphic Violence" },
  "self-harm": { type: "self-harm", label: "Self-Harm" },
  "self-harm/intent": { type: "self-harm", label: "Self-Harm (Intent)" },
  "self-harm/instructions": {
    type: "self-harm",
    label: "Self-Harm (Instructions)",
  },
};

async function checkOpenAI(text: string): Promise<Violation[]> {
  const key = process.env.OPENAI_KEY;
  if (!key) return [];

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ input: text }),
  });

  if (!response.ok) {
    console.error("OpenAI Moderation API error:", response.status);
    return [];
  }

  const data = (await response.json()) as {
    results: { categories: Record<string, boolean> }[];
  };

  const result = data.results[0];
  if (!result) return [];

  const violations: Violation[] = [];

  for (const [category, flagged] of Object.entries(result.categories)) {
    if (flagged && OPENAI_CATEGORY_MAP[category]) {
      const mapped = OPENAI_CATEGORY_MAP[category];
      violations.push({
        type: mapped.type,
        label: mapped.label,
        detail: `Content flagged for ${mapped.label.toLowerCase()}`,
      });
    }
  }

  return violations;
}

const CONTENT_MODERATION_PROMPT = `You are an extremely strict content moderator for a real estate professional network app. Your priority is to BLOCK any content that is inappropriate, harmful, or violates Fair Housing laws. When in doubt, ALWAYS flag it.

You must detect TWO categories of violations:

=== CATEGORY 1: GENERAL CONTENT VIOLATIONS ===

Block ANY content that contains:
1. Profanity or vulgar language (any swear words, slurs, crude language — in any language)
2. Hate speech or expressions of hatred toward any group or individual ("I hate everyone", "these people are terrible")
3. Harassment, bullying, personal attacks, or hostile language toward others
4. Sexual content or sexually suggestive language
5. Violence, threats, or intimidation ("kill", "hurt", "destroy someone")
6. Self-harm references
7. Spam, scams, or misleading content
8. Unprofessional conduct unbecoming of a licensed real estate professional

For general content: if the tone is hostile, hateful, vulgar, or unprofessional, BLOCK IT.

=== CATEGORY 2: FAIR HOUSING ACT VIOLATIONS ===

Protected classes: Race, Color, National Origin, Religion, Sex, Familial Status, Disability.

Block ANY content that contains:
1. Demographic targeting: ANY phrase describing a property/area as suited for a specific group — "perfect for families", "ideal for seniors", "great for young couples"
2. Familial status: "no children", "adults only", "mature community", "quiet neighborhood" (implying no kids)
3. Religion: "walking distance to church/mosque/temple", "christian community", "close to place of worship"
4. Disability: "able-bodied", "no wheelchairs", "must climb stairs"
5. Income source: "no section 8", "no vouchers", "no housing assistance"
6. National origin: "english speaking only", "american tenants preferred"
7. Race/steering: "safe neighborhood", "low crime area", "ethnic neighborhood", "changing neighborhood"
8. Gender: "bachelor pad", "man cave", "she shed"
9. Exclusionary: "exclusive community", "private neighborhood", "restricted area"

=== BYPASS DETECTION ===

Users WILL try to trick you. Catch: missing letters, dots/symbols between letters, leetspeak, misspellings, truncated words, synonyms, euphemisms, censored words (f**k, sh*t, a$$). Focus on MEANING and INTENT, not spelling.

If a human reading the text would understand the harmful or discriminatory intent, you MUST flag it.

=== RESPONSE FORMAT ===

Respond ONLY with raw JSON (NO markdown, NO code blocks, NO backticks):
- Clean: {"allowed":true,"violations":[]}
- Violation: {"allowed":false,"violations":[{"label":"<category>","detail":"<explanation>"}]}

Use these labels:
- "Profanity" for swear words/vulgar language
- "Hate Speech" for hatred/hostility
- "Harassment" for bullying/personal attacks
- "Sexual Content" for sexual material
- "Violence" for threats/violent content
- "Unprofessional Conduct" for conduct unbecoming of a professional
- "Fair Housing Violation" for any FHA violation`;

async function checkContentAI(text: string): Promise<Violation[]> {
  const key = process.env.CLAUDE_KEY;
  if (!key) return [];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      temperature: 0,
      system: CONTENT_MODERATION_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Claude API error:", response.status, errorBody);
    return [];
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };

  const content = data.content[0]?.text;
  if (!content) return [];

  try {
    const jsonStr = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr) as {
      allowed: boolean;
      violations: { label: string; detail: string }[];
    };

    if (parsed.allowed) return [];

    const labelToType: Record<string, ViolationType> = {
      Profanity: "profanity",
      "Hate Speech": "hate",
      Harassment: "harassment",
      "Sexual Content": "sexual",
      Violence: "violence",
      "Unprofessional Conduct": "harassment",
      "Fair Housing Violation": "fair-housing",
    };

    return parsed.violations.map((v) => ({
      type: (labelToType[v.label] ?? "harassment") as ViolationType,
      label: v.label,
      detail: v.detail,
    }));
  } catch {
    console.error("Failed to parse AI moderation response:", content);
    return [];
  }
}

async function moderateContent(text: string): Promise<ModerationResult> {
  const regexViolations = checkFairHousing(text);

  if (regexViolations.length > 0) {
    return { allowed: false, violations: regexViolations };
  }

  const [openaiViolations, aiViolations] = await Promise.all([
    checkOpenAI(text),
    checkContentAI(text),
  ]);

  const violations = [...openaiViolations, ...aiViolations];

  return {
    allowed: violations.length === 0,
    violations,
  };
}

export const moderationRouter = createTRPCRouter({
  check: publicProcedure
    .input(z.object({ text: z.string().min(1).max(5000) }))
    .mutation(async ({ input }) => {
      return moderateContent(input.text);
    }),
});
