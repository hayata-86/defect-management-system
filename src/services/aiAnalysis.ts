import { generateClient } from "aws-amplify/data";

import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>({
  authMode: "userPool",
});

export type AIAnalysisResult = {
  analysis: string;
};

export async function analyzeDefects(
  prompt: string,
): Promise<AIAnalysisResult> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("AI分析に渡す情報がありません。");
  }

  const { data, errors } =
    await client.queries.analyzeDefects({
      prompt: normalizedPrompt,
    });

  if (errors && errors.length > 0) {
    console.error(
      "AI analysis GraphQL errors:",
      errors,
    );

    throw new Error(
      errors
        .map((error) => error.message)
        .join("\n"),
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.analysis?.trim()) {
    throw new Error(
      "AIから分析結果を取得できませんでした。",
    );
  }

  return {
    analysis: data.analysis,
  };
}