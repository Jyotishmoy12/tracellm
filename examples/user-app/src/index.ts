import { TraceLLM } from "@tracellm/sdk-node";

interface Customer {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

interface OpenAIResponse {
  id: string;
  model: string;
  output_text?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface AnthropicResponse {
  id: string;
  model: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

type LlmProvider = "openai" | "anthropic" | "gemini";

interface LlmResult {
  provider: LlmProvider;
  model: string;
  responseId: string;
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const endpoint = process.env.TRACELLM_ENDPOINT ?? "http://localhost:4319";
const apiKey = process.env.TRACELLM_API_KEY;
const llmProvider = readLlmProvider(process.env.LLM_PROVIDER ?? "openai");
const llmModel = readModel(llmProvider);
const customerId = Number(process.env.USER_APP_CUSTOMER_ID ?? "1");

if (!apiKey) {
  throw new Error("Set TRACELLM_API_KEY to the API key copied from the TraceLLM UI.");
}
assertProviderKey(llmProvider);

const tracellm = new TraceLLM({
  endpoint,
  apiKey,
  serviceName: "customer-support-assistant"
});

const session = await tracellm.startSession({
  name: "Customer support answer workflow",
  userId: `customer_${customerId}`,
  attributes: {
    app: "example-user-app",
    workflow: "support-answer",
    customerId
  },
  input: "Customer asks why their account activity looks unusual."
});

try {
  const customerSpan = await session.startSpan({
    name: "fetch.customer.profile",
    kind: "tool",
    attributes: {
      source: "jsonplaceholder",
      customerId
    }
  });
  const customer = await getJson<Customer>(`https://jsonplaceholder.typicode.com/users/${customerId}`);
  await customerSpan.end({
    status: "ok",
    attributes: {
      customerName: customer.name,
      company: customer.company.name
    }
  });

  const activitySpan = await session.startSpan({
    name: "fetch.customer.activity",
    kind: "retrieval",
    attributes: {
      source: "jsonplaceholder",
      customerId
    }
  });
  const posts = await getJson<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${customerId}`);
  await activitySpan.recordEvent({
    name: "activity.loaded",
    attributes: {
      records: posts.length
    }
  });
  await activitySpan.end({
    status: "ok",
    attributes: {
      records: posts.length
    }
  });

  const answerSpan = await session.startSpan({
    name: `${llmProvider}.chat.generate`,
    kind: "llm",
    attributes: {
      provider: llmProvider,
      model: llmModel
    },
    input: buildPrompt(customer, posts)
  });
  const llmResponse = await createLlmAnswer(buildPrompt(customer, posts));
  const answer = llmResponse.text;
  await answerSpan.recordEvent({
    name: "llm.response.created",
    attributes: {
      responseId: llmResponse.responseId,
      provider: llmResponse.provider,
      model: llmResponse.model,
      answerLength: answer.length
    }
  });
  await answerSpan.end({
    status: "ok",
    usage: llmResponse.usage,
    output: answer
  });

  await session.end({
    status: "ok",
    output: answer,
    attributes: {
      completed: true,
      activityRecords: posts.length
    }
  });

  console.log("User app trace complete");
  console.log(`TraceLLM endpoint: ${endpoint}`);
  console.log(`Session ID: ${session.id}`);
  console.log(`Trace ID: ${session.traceId}`);
  console.log(`Customer: ${customer.name}`);
  console.log(`LLM provider: ${llmResponse.provider}`);
  console.log(`LLM model: ${llmResponse.model}`);
  console.log(`Answer: ${answer}`);
} catch (error) {
  await session.recordError({
    name: "support.workflow.failed",
    message: error instanceof Error ? error.message : "Unknown support workflow error",
    type: error instanceof Error ? error.name : "Error",
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
  });
  await session.end({ status: "error" });
  throw error;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "tracellm-example-user-app"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.json() as Promise<T>;
}

function buildPrompt(customer: Customer, posts: Post[]): string {
  return [
    "You are a helpful customer support assistant.",
    `Customer: ${customer.name}`,
    `Email: ${customer.email}`,
    `Company: ${customer.company.name}`,
    `Recent activity count: ${posts.length}`,
    `Latest activity title: ${posts[0]?.title ?? "none"}`,
    "Write a short, clear support answer explaining that we reviewed their recent account activity."
  ].join("\n");
}

function readLlmProvider(value: string): LlmProvider {
  if (value === "openai" || value === "anthropic" || value === "gemini") {
    return value;
  }
  throw new Error("LLM_PROVIDER must be one of: openai, anthropic, gemini.");
}

function readModel(provider: LlmProvider): string {
  if (provider === "openai") {
    return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";
  }
  return process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
}

function assertProviderKey(provider: LlmProvider): void {
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    throw new Error("Set OPENAI_API_KEY or choose another LLM_PROVIDER.");
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("Set ANTHROPIC_API_KEY or choose another LLM_PROVIDER.");
  }
  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    throw new Error("Set GEMINI_API_KEY or choose another LLM_PROVIDER.");
  }
}

async function createLlmAnswer(prompt: string): Promise<LlmResult> {
  if (llmProvider === "openai") {
    return createOpenAIAnswer(prompt);
  }
  if (llmProvider === "anthropic") {
    return createAnthropicAnswer(prompt);
  }
  return createGeminiAnswer(prompt);
}

async function createOpenAIAnswer(prompt: string): Promise<LlmResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: llmModel,
      input: prompt
    })
  });

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`OpenAI API failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const parsed = data as OpenAIResponse;
  const text = readOpenAIText(parsed);
  return {
    provider: "openai",
    model: parsed.model,
    responseId: parsed.id,
    text,
    usage: {
      inputTokens: parsed.usage?.input_tokens ?? 0,
      outputTokens: parsed.usage?.output_tokens ?? 0,
      totalTokens: parsed.usage?.total_tokens ?? 0
    }
  };
}

function readOpenAIText(response: OpenAIResponse): string {
  if (response.output_text) {
    return response.output_text;
  }

  const text = response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return text;
}

async function createAnthropicAnswer(prompt: string): Promise<LlmResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: llmModel,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`Anthropic API failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const parsed = data as AnthropicResponse;
  const text = parsed.content
    .map((content) => content.text)
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Anthropic response did not include text output.");
  }

  const inputTokens = parsed.usage?.input_tokens ?? 0;
  const outputTokens = parsed.usage?.output_tokens ?? 0;

  return {
    provider: "anthropic",
    model: parsed.model,
    responseId: parsed.id,
    text,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens
    }
  };
}

async function createGeminiAnswer(prompt: string): Promise<LlmResult> {
  const key = process.env.GEMINI_API_KEY ?? "";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${llmModel}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`Gemini API failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const parsed = data as GeminiResponse;
  const text = parsed.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text)
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini response did not include text output.");
  }

  return {
    provider: "gemini",
    model: llmModel,
    responseId: "gemini-generateContent",
    text,
    usage: {
      inputTokens: parsed.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: parsed.usageMetadata?.candidatesTokenCount ?? 0,
      totalTokens: parsed.usageMetadata?.totalTokenCount ?? 0
    }
  };
}
