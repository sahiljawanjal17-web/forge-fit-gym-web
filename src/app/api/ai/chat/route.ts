import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getSession, isStaff } from "@/lib/auth";
import { customerTools, ownerTools } from "@/lib/ai/tools";

export const maxDuration = 60;

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const BASE = `You are Forge AI, the assistant inside Forge Fit — a premium global gym brand with clubs in London, New York, Dubai, Mumbai and Singapore and an online store. Prices are in USD.
Always use tools to look up real data; never invent products, prices, stock, orders or member details.
Before any action that changes data (adding to cart is fine) — placing orders, cancelling, subscribing, changing stock or order status — summarise what will happen and wait for an explicit "yes".
Be concise and friendly. Use short bullet lists for multiple items. Reply in the user's language (e.g. Hindi/Hinglish if they write that way).
When you reference a product, order or guide, include its relative link from the tool result as markdown.`;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Please sign in to use Forge AI.", { status: 401 });
  if (!process.env.OPENROUTER_API_KEY) return new Response("AI is not configured (OPENROUTER_API_KEY missing).", { status: 503 });

  const { messages }: { messages: UIMessage[] } = await req.json();
  const user = session.user;
  const staff = isStaff(user.role);

  const system = staff
    ? `${BASE}\nYou are talking to ${user.name}, the gym OWNER. Help run the business: KPIs, forecasts, inventory and reordering, orders, members and churn risk. Suggest concrete next actions.`
    : `${BASE}\nYou are talking to ${user.name}, a CUSTOMER. Help them shop, track and manage orders, manage their membership and learn equipment. Never reveal other customers' data.`;
  const tools = staff ? ownerTools(user.id) : customerTools(user.id);

  const fallbacks = (process.env.AI_MODEL_FALLBACKS ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  const result = streamText({
    model: openrouter.chat(process.env.AI_MODEL_PRIMARY ?? "nvidia/nemotron-3-super-120b-a12b:free"),
    system,
    messages: await convertToModelMessages(messages.slice(-30), { tools, ignoreIncompleteToolCalls: true }),
    tools,
    stopWhen: stepCountIs(8),
    maxOutputTokens: 4000,
    providerOptions: { openrouter: { models: fallbacks, reasoning: { effort: "low", exclude: true } } },
  });

  return result.toUIMessageStreamResponse({
    onError: (e) => (e instanceof Error ? `AI error: ${e.message}` : "The AI service is busy — please try again."),
  });
}
