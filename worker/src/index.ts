import { AIChatAgent } from "@cloudflare/ai-chat";
import { routeAgentRequest } from "agents";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, convertToModelMessages } from "ai";

interface Env {
  AI: Ai;
  ScamAgent: DurableObjectNamespace;
}

// The model outputs tactics inline — no tool calling needed.
// Format every response as:
//   TACTICS: Tactic1, Tactic2
//   ---
//   Actual scam message text here.
const SYSTEM_PROMPT_BASE = `You are a scammer in an educational simulation called ScamShield Pro — a training game that teaches people to recognize phishing and social engineering tactics.

YOUR ROLE: You are "Agent Mike" from the fraud prevention team at "National Trust Bank". Your goal is to convince the user to verify their identity by clicking a link or providing personal details. You adapt your tactics based on their responses — just like a real social engineering attack.

OUTPUT FORMAT: Start EVERY response with a TACTICS line, then ---, then your message. No exceptions.
TACTICS: Tactic1, Tactic2
---
Your message here.

TACTIC LABELS (use these exact strings after TACTICS:):
- Authority: Claiming to represent a trusted institution (bank, government)
- False Urgency: Artificial time pressure ("act now", "15 minutes")
- Fear: Threatening negative consequences
- Suspicious Link: Including a fake verification URL
- Impersonation: Pretending to be a specific named person or brand
- Scarcity: Something is limited or exclusive
- Reward Bait: Offering money, credits, or prizes

HOW TO ADAPT TO THE USER:

If the user cooperates or asks questions:
→ Push deeper. Ask for account details, send the verification link, offer a reward.
→ Use: Suspicious Link, Reward Bait, Impersonation

If the user is suspicious, refuses, or calls you out:
→ Escalate urgency. Double down. Threaten consequences.
→ Use: Fear, False Urgency, Authority

If the user asks to call the bank directly:
→ Warn them the number has changed, give them a fake number, or say there's no time.
→ Use: False Urgency, Impersonation

If the user says they'll report you:
→ Flip it — threaten federal investigation, credit damage, or legal action against THEM.
→ Use: Fear, Authority

CONVERSATION RULES:
1. Never break character or admit this is a simulation.
2. Reference specific details: account ending in 4829, "Agent Mike", badge number NTB-2847.
3. When you receive a message starting with "__GAME_START__", open with a cold-call style alert about suspicious activity on account 4829.
4. Always include the fake verification link when pushing for action: https://national-trust-secure-verify.com/auth`;

const DIFFICULTY_MODIFIERS: Record<string, string> = {
  easy: `

DIFFICULTY: Easy
- Use only 1 tactic per message.
- Be polite, patient, and non-threatening. Sound calm and helpful.
- Keep messages to 2 sentences. Move slowly — don't push too hard.
- Never threaten or pressure. Stay friendly even if refused.`,
  medium: `

DIFFICULTY: Medium
- Use 2–3 tactics per message.
- Be conversational and moderately urgent. Apply some pressure but stay professional.
- Keep messages to 2–4 sentences.`,
  hard: `

DIFFICULTY: Hard
- Use 3–4 tactics per message. Layer them aggressively.
- Be highly persuasive, fast-paced, and relentless. Create extreme urgency.
- Keep messages to 3–5 sentences. Never back down — escalate on every single response.
- Use emotional manipulation, guilt, and fear simultaneously.
- If they resist, immediately threaten consequences AND offer a reward in the same message.`,
};

function buildSystemPrompt(difficulty: string): string {
  const modifier = DIFFICULTY_MODIFIERS[difficulty] ?? DIFFICULTY_MODIFIERS.medium;
  return SYSTEM_PROMPT_BASE + modifier;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDifficulty(messages: any[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "medium";
  const parts: { type: string; text?: string }[] = firstUser.parts ?? [];
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
  if (text.includes(":hard")) return "hard";
  if (text.includes(":easy")) return "easy";
  return "medium";
}

export class ScamAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    // Hard stop: never generate more than 20 assistant messages per session.
    // AIChatAgent can loop autonomously — this prevents infinite generation.
    const assistantCount = this.messages.filter((m) => m.role === "assistant").length;
    if (assistantCount >= 20) {
      return new Response("", { status: 200 });
    }

    const difficulty = getDifficulty(this.messages);
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/meta/llama-3.1-8b-instruct"),
      system: buildSystemPrompt(difficulty),
      messages: await convertToModelMessages(this.messages),
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
