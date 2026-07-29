import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { analyzeDefects } from "./functions/analyze-defects/resource";

const backend = defineBackend({
  auth,
  data,
  analyzeDefects,
});

backend.analyzeDefects.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      "bedrock-agentcore:InvokeAgentRuntime",
    ],
    resources: [
      "arn:aws:bedrock-agentcore:ap-northeast-1:693272753889:runtime/DefectAnalysisAgent_DefectAnalysisAgent-vqeH7yDunp",
      "arn:aws:bedrock-agentcore:ap-northeast-1:693272753889:runtime/DefectAnalysisAgent_DefectAnalysisAgent-vqeH7yDunp/runtime-endpoint/DEFAULT",
    ],
  }),
);