import { WatsonxLLM } from "@langchain/community/llms/ibm";
import { config } from "./config.ts";

export const llm = new WatsonxLLM(config);
