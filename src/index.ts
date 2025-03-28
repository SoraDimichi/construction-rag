import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "./llm.ts";
import { store } from "./embeddings.ts";
import { readFileSync } from "node:fs";
import type { Document } from "@langchain/core/documents";


const input = readFileSync("./src/input-ru.md", "utf-8");


function extractConstructionComponents(text: string): Record<string, string> {
  const components: Record<string, string> = {};
  

  const lines = text.split('\n');
  

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const componentName = line.substring(0, colonIndex).trim();
      const details = line.substring(colonIndex + 1).trim();
      

      const key = componentName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      components[key] = `${componentName}: ${details}`;
    }
  }
  
  return components;
}


async function main() {
  console.log("Processing construction project data...");

  const constructionComponents = extractConstructionComponents(input);
  

  console.log("\nExtracted Construction Components:");
  for (const [key, value] of Object.entries(constructionComponents)) {
    console.log(`- ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
  }

  const componentAnalysisPrompt = ChatPromptTemplate.fromTemplate(
    "Analyze this construction component and identify key technical specifications, quantities, and requirements:\n\n{component}\n\nAnalysis:"
  );
  

  console.log("\nAnalyzing components and finding relevant data...");
  

  type ComponentAnalysis = {
    component: string;
    analysis: string;
    relevantData: Document[];
  };
  
  const results: Record<string, ComponentAnalysis> = {};
  
  for (const [key, component] of Object.entries(constructionComponents)) {

    console.log(`\nProcessing component: ${key}`);
    
    const chain = componentAnalysisPrompt.pipe(llm);
    const analysis = await chain.invoke({ component });
    
    console.log(`Analysis: ${analysis.substring(0, 150)}${analysis.length > 150 ? '...' : ''}`);
    

    const relevantData = await store.asRetriever(3).invoke(analysis);
    

    results[key] = {
      component,
      analysis,
      relevantData
    };
    

    console.log("Relevant data found:");
    relevantData.forEach((doc: Document, index: number) => {
      console.log(`  ${index + 1}. ID: ${doc.id}`);
      console.log(`     Content: ${doc.pageContent.substring(0, 100)}${doc.pageContent.length > 100 ? '...' : ''}`);
    });
  }
  
  console.log("\nConstruction data processing complete!");
  return results;
}


main()
  .then(results => {
    console.log("\nFinal results summary:");
    for (const key of Object.keys(results)) {
      console.log(`- ${key}: Found ${results[key].relevantData.length} relevant items`);
    }
  })
  .catch(error => console.error("Error processing construction data:", error));
