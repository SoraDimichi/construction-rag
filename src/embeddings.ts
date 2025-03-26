import { WatsonxEmbeddings } from "@langchain/community/embeddings/ibm";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { fileURLToPath } from "url";
import { config } from "./config.ts";
import { Document } from "@langchain/core/documents";

const embeddings = new WatsonxEmbeddings({
  ...config,
  model: "ibm/slate-125m-english-rtrvr",
});

const STORAGE_NAME = "memory-vectors.json";
const STORAGE_PATH = fileURLToPath(new URL(STORAGE_NAME, import.meta.url));

const store = new MemoryVectorStore(embeddings);

if (!existsSync(new URL(STORAGE_NAME, import.meta.url))) {
  const content = readFileSync(STORAGE_PATH, "utf-8");
  const data: Record<string, string> = JSON.parse(content);
  const docs: any = Object.entries(data).map(
    ([id, pageContent]) =>
      new Document({
        pageContent,
        id,
      }),
  );

  const splitDocsByChunks = (docs: any[]): any[][] => {
    const chunks: any[][] = [];
    let currentIndex = 0;
    while (currentIndex < docs.length) {
      let currentChunk: any[] = [];
      let canAddMore = true;
      while (canAddMore && currentIndex < docs.length) {
        const nextStep = docs.slice(currentIndex, currentIndex + 1);
        if (!nextStep.length) break;
        const candidate = currentChunk.concat(nextStep);
        if (JSON.stringify(candidate).length <= 950) {
          currentChunk = candidate;
          currentIndex += nextStep.length;
        } else {
          if (!currentChunk.length) {
            currentChunk.push(docs[currentIndex]);
            currentIndex++;
          }
          canAddMore = false;
        }
      }
      chunks.push(currentChunk);
    }
    return chunks;
  };

  const splittedDocs = splitDocsByChunks(docs);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const addDocumentsToStore = async (docs: any[]) => {
    let i = 0;
    for await (const group of docs) {
      await store.addDocuments(group);
      await delay(500);
      writeFileSync(STORAGE_PATH, JSON.stringify(store.memoryVectors));
      i++;
      console.log(`${i} of ${docs.length} groups added`);
    }
  };

  await addDocumentsToStore(splittedDocs);
} else {
  const memoryVectors = JSON.parse(readFileSync(STORAGE_PATH, "utf-8"));

  store.memoryVectors = memoryVectors;
}

export { store };
