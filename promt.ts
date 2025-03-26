import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model.ts";

const prompt = ChatPromptTemplate.fromTemplate("Tell me a {adjective} joke");
const chain = prompt.pipe(model);

chain
  .invoke({ adjective: "funny" })
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
