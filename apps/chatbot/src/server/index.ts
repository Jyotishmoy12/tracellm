import { env, providerModel } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.CHATBOT_PORT, () => {
  console.log(`Chatbot API running at http://localhost:${env.CHATBOT_PORT}`);
  console.log(`Provider: ${env.CHATBOT_PROVIDER}`);
  console.log(`Model: ${providerModel()}`);
  console.log("TraceLLM: disabled for baseline test");
});
