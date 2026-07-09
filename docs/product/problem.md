# Problem And Positioning

LLM applications are not just one API request. A real workflow may include prompt construction, retrieval, tool calls, model calls, retries, parsing, validation, and user-facing output. When something goes wrong, normal logs often do not answer the important questions.

TraceLLM solves this by giving teams a structured timeline of what the LLM application did.

## The Problem

Teams building LLM apps need to answer:

- Which user workflow produced this answer?
- Which model/provider was called?
- Which prompt, retrieval, or tool step influenced the output?
- How many tokens did the workflow use?
- What failed, and where?
- Which traces contain sensitive content?
- Can tracing be turned down or filtered without changing app code?

Generic logs can capture fragments of this, but they usually lack a session/span model that fits LLM workflows.

## What TraceLLM Adds

TraceLLM introduces a product-level trace model:

- **Session**: one user or agent workflow.
- **Span**: one timed operation inside a workflow, such as an LLM call or tool call.
- **Event**: one instant point in time inside a session or span.
- **Error**: a structured event with exception details.
- **Project config**: runtime control over what the SDK captures.
- **API key**: connects external applications to a project.

## Who It Is For

TraceLLM is for developers and teams building:

- AI assistants
- agent workflows
- RAG systems
- support automation
- internal copilot tools
- LLM-powered SaaS features

## What It Is Not

TraceLLM is not an LLM provider. It does not replace OpenAI, Anthropic, or Gemini. The user keeps freedom to choose any provider.

TraceLLM observes the workflow around those providers.

## Why SigNoz Is Included

TraceLLM owns the product-specific LLM timeline. SigNoz owns broader OpenTelemetry observability.

Use TraceLLM to understand the LLM workflow. Use SigNoz to connect backend telemetry, service health, latency, and traces across the larger system.
