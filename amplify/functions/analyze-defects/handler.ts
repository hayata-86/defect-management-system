import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from "@aws-sdk/client-bedrock-agentcore";

type AnalyzeDefectsEvent = {
  arguments?: {
    prompt?: string;
  };
  prompt?: string;
};

type AnalyzeDefectsResult = {
  analysis?: string;
  error?: string;
};

const client = new BedrockAgentCoreClient({
  region: "ap-northeast-1",
});

const readResponseBody = async (body: unknown): Promise<string> => {
  if (!body) {
    return "";
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof Uint8Array) {
    return new TextDecoder("utf-8").decode(body);
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "transformToString" in body &&
    typeof body.transformToString === "function"
  ) {
    return body.transformToString();
  }

  return String(body);
};

export const handler = async (
  event: AnalyzeDefectsEvent,
): Promise<AnalyzeDefectsResult> => {
  const prompt = event.arguments?.prompt ?? event.prompt;

  if (!prompt?.trim()) {
    return {
      error: "分析対象の不具合情報を入力してください。",
    };
  }

  const agentRuntimeArn = process.env.AGENT_RUNTIME_ARN;

  if (!agentRuntimeArn) {
    return {
      error: "AgentCore Runtime ARNが設定されていません。",
    };
  }

  try {
    const payload = JSON.stringify({
      prompt: prompt.trim(),
    });

    const command = new InvokeAgentRuntimeCommand({
      agentRuntimeArn,
      qualifier: "DEFAULT",
      runtimeSessionId: crypto.randomUUID(),
      payload: new TextEncoder().encode(payload),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await client.send(command);
    const responseText = await readResponseBody(response.response);

    /*
     * agent.pyが文字列を返すため、レスポンスがJSON文字列として
     * 二重引用符で囲まれる場合に備えてJSON.parseを試します。
     */
    let analysis = responseText;

    try {
      const parsed: unknown = JSON.parse(responseText);

      if (typeof parsed === "string") {
        analysis = parsed;
      } else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "analysis" in parsed &&
        typeof parsed.analysis === "string"
      ) {
        analysis = parsed.analysis;
      }
    } catch {
      // JSONでなければ取得した本文をそのまま使用します。
    }

    return {
      analysis,
    };
  } catch (error) {
    console.error("AgentCore Runtime invocation failed:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "AI分析の実行中にエラーが発生しました。",
    };
  }
};