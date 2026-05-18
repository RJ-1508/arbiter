import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { rollDice } from "../agent/tools/rollDice.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const modelWithTools = model.bindTools([rollDice]);

const response = await modelWithTools.invoke("Roll eight d6s for me.");

console.log("tool calls:", response.tool_calls);

if (response.tool_calls?.length) {
  const call = response.tool_calls[0];
  const result = await rollDice.invoke(call);
  console.log("tool result:", result);
}
