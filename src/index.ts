import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "./llm.ts";
import { store } from "./embeddings.ts";
import { readFileSync } from "fs";

const input = readFileSync("./src/input.md", "utf-8");

const prompt = ChatPromptTemplate.fromTemplate(
  "Break down this prompt into small construction steps 1 step by line, write only steps without headers:\n\n{input}\n\nSteps:",
);

const chain = prompt.pipe(llm);

chain
  .invoke({ input })
  .then((result) => {
    console.log(result);
    return store.asRetriever(1).invoke(result);
  })
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
