import { WatsonxEmbeddings } from "@langchain/community/embeddings/ibm";
import { readFileSync } from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { config } from "./config.ts";
import { Document } from "@langchain/core/documents";

console.log(`${config.serviceUrl}/ml/v1/text/embeddings`);

export const embeddings = new WatsonxEmbeddings({
  ...config,
  model: "ibm/slate-125m-english-rtrvr",
});

const fileContent = readFileSync("./result.json", "utf-8");
const jsonData: Record<string, string> = JSON.parse(fileContent);
const chunkedDocs: any = Object.entries(jsonData).map(
  ([id, pageContent]) =>
    new Document({
      pageContent: pageContent.slice(0, 999),
      id,
    }),
);

const vectorstore = MemoryVectorStore.fromDocuments(chunkedDocs, embeddings)
  .then((vectorStore) => vectorStore.asRetriever(1))
  .then((retriever) => retriever.invoke("What is LangChain?"))
  .then((returnedDocuments) => console.log(returnedDocuments[0].pageContent))
  .catch((error) => console.error(error));
