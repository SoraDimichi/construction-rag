import { WatsonxEmbeddings } from "@langchain/community/embeddings/ibm";
import { readFileSync } from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { config } from "./config.ts";
import { Document } from "@langchain/core/documents";

export const embeddings = new WatsonxEmbeddings({
  ...config,
  model: "ibm/slate-125m-english-rtrvr",
});

const fileContent = readFileSync("./result.json", "utf-8");
const jsonData: Record<string, string> = JSON.parse(fileContent);
const docs: any = Object.entries(jsonData).map(
  ([id, pageContent]) =>
    new Document({
      pageContent,
      id,
    }),
);

const cutoff = docs.splice(0, 100);

MemoryVectorStore.fromDocuments(cutoff, embeddings)
  .then((vectorStore) => vectorStore.asRetriever(1))
  .then((retriever) => retriever.invoke("What is LangChain?"))
  .then((returnedDocuments) => console.log(returnedDocuments[0].pageContent))
  .catch((error) => console.error(error));
