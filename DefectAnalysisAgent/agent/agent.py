from typing import Any

from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent
from strands.models import BedrockModel


app = BedrockAgentCoreApp()

model = BedrockModel(
    model_id="amazon.nova-lite-v1:0",
    region_name="ap-northeast-1",
)

agent = Agent(
    model=model,
    system_prompt="""
あなたは不具合管理システムの分析担当AIです。

入力された不具合情報を分析し、次の観点で日本語の回答を作成してください。

1. 不具合の傾向
2. 主な原因
3. 優先して改善すべき項目
4. 再発防止策
5. 今後確認すべき指標

入力されていない内容を事実として断定しないでください。
情報が不足している場合は、その旨を明示してください。
""".strip(),
)


@app.entrypoint
def invoke(payload: dict[str, Any]) -> str:
    prompt = payload.get("prompt")

    if not isinstance(prompt, str) or not prompt.strip():
        return "promptを入力してください。"

    result = agent(prompt.strip())

    return result.message["content"][0]["text"]


if __name__ == "__main__":
    app.run()