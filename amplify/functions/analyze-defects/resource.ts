import { defineFunction } from "@aws-amplify/backend";

export const analyzeDefects = defineFunction({
  name: "analyze-defects",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  environment: {
    AGENT_RUNTIME_ARN:
      "arn:aws:bedrock-agentcore:ap-northeast-1:693272753889:runtime/DefectAnalysisAgent_DefectAnalysisAgent-vqeH7yDunp",
  },
});