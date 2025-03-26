const watsonxAIApikey = process.env.AI_APIKEY;
const projectId = process.env.PROJECT_ID;
const serviceUrl = process.env.SERVICE_URL;

if (!watsonxAIApikey) throw new Error("AI_APIKEY is required");
if (!projectId) throw new Error("PROJECT_ID is required");
if (!serviceUrl) throw new Error("SERVICE_URL is required");

export const config = {
  serviceUrl,
  projectId,
  watsonxAIApikey,
  model: "ibm/granite-3-2b-instruct",
  version: "2025-03-26",
  watsonxAIAuthType: "iam",
};
