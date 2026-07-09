# Core Concepts

TraceLLM uses a small set of primitives that map to real LLM application behavior.

## Session

A session is one LLM or user workflow run.

Examples:

- A user asks a support assistant a question.
- An agent researches a task and creates a report.
- A RAG endpoint answers one query.

Sessions have:

- `sessionId`
- `traceId`
- `name`
- `status`
- `startedAt`
- `endedAt`
- optional `userId`
- optional `input` and `output`
- metadata attributes

## Span

A span is one timed operation inside a session.

Examples:

- `openai.chat.generate`
- `fetch.customer.profile`
- `retrieve.documents`
- `tool.weather.lookup`
- `parse.model.output`

Span kinds:

| Kind | Use For |
| --- | --- |
| `llm` | model calls |
| `tool` | external APIs or tools |
| `retrieval` | search, vector DB, RAG retrieval |
| `agent` | agent planning or execution |
| `workflow` | larger nested workflow step |
| `custom` | anything else |

## Event

An event is an instant record inside a session or span.

Examples:

- `prompt.rendered`
- `documents.loaded`
- `tool.selected`
- `llm.response.created`

Events are useful when there is no duration to measure but the moment matters.

## Error

An error is a structured event with exception metadata.

Errors can include:

- name
- message
- type
- stack, when content capture allows it
- attributes

## Project

A project groups traces, API keys, and tracing configuration.

In a hosted product, each customer account would own one or more projects. Locally, a new account gets a default project.

## API Key

SDKs authenticate with TraceLLM using a project API key.

API keys are created in the TraceLLM UI. The full secret is shown only once. Store it in the application environment as `TRACELLM_API_KEY`.
