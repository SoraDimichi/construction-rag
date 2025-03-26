import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";



async function runLangChainWatsonExample() {
  try {
    // Initialize the WatsonxAI model
    const model = new WatsonxAI({
      ibmCloudApiKey: process.env.WATSONX_AI_APIKEY ?? '',
      serviceUrl: process.env.WATSON_SERVICE_URL ?? '',
      projectId: process.env.WATSON_PROJECT_ID,
      modelId: "ibm/granite-3-8b-instruct", 
      version: "2025-03-26",
      parameters: {
        temperature: 0.7,
        max_new_tokens: 150,
        top_p: 0.9,
      }
    });

    // Create a simple prompt template
    const promptTemplate = PromptTemplate.fromTemplate(
      "Answer the following question: {question}"
    );

    // Create a chain that combines the model with the prompt template
    const chain = promptTemplate.pipe(model);

    // Run the chain
    console.log("Running chain...");
    const result = await chain.invoke({
      question: "What are the benefits of using LangChain with Watson AI?"
    });

    console.log("Result:", result);

    // Example with follow-up processing
    console.log("\nRunning another example with multiple inputs...");
    const questions = [
      "What is machine learning?", 
      "How does natural language processing work?"
    ];
    
    const results = await Promise.all(
      questions.map(question => 
        chain.invoke({ question })
      )
    );
    
    console.log("Multiple results:");
    results.forEach((res, idx) => {
      console.log(`\nQuestion ${idx + 1}: ${questions[idx]}`);
      console.log(`Answer: ${res}`);
    });

  } catch (error) {
    console.error("Error running LangChain with Watson:", error);
    if (error.response) {
      console.error("Response error details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the example
runLangChainWatsonExample();