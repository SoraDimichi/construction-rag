import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { model } from "./model.ts";

const breakdownPrompt = new PromptTemplate({
  template:
    "Break down this prompt into small construction steps:\n\n{input}\n\nSteps:",
});
const breakdownChain = new LLMChain({ llm: model, prompt: breakdownPrompt });

const runProcess = (inputPrompt: string) =>
  breakdownChain.call({ input: inputPrompt }).then((brokenDown) => {
    const loader = new TextLoader("tables.txt");
    return loader.load().then((docs) => {
      const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
        space: "cosine",
      });
      return vectorStore.addDocuments(docs).then(() =>
        vectorStore.similaritySearch(brokenDown.text, 5).then((res) => ({
          constructionSteps: brokenDown.text,
          matchedTables: res.map((r) => r.pageContent),
        })),
      );
    });
  });

runProcess("Calculate cost of painting a wall and find relevant tables")
  .then((r) => console.log(r))
  .catch((e) => console.error(e));
