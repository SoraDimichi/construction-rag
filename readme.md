<https://js.langchain.com/docs/integrations/llms/ibm/>

<https://cloud.ibm.com/apidocs/watsonx-ai#text-embeddings>

### CHANGELOG

#### v.0.0.1

1. The `readme.md` file was created as documentation.
2. A mechanism was developed to produce vectorised data in `JSON` format in `embeddings.ts`.
3. Furthermore, the overall architecture was refined:

- `config.ts` now stores the LLM configuration
- `llm.ts` handles LLM initialisation
- `embeddings.ts` manages the vectorisation process
- `global.ts` defines the types of environment variables
- and `index.ts` contains the core logic of the application.

#### v.0.0.0

1. Initially, the repository was created.
2. Functionality for converting `XML` to `JSON` was implemented in `parser.ts`.
