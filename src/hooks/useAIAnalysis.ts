import { useState } from "react";

import {
  analyzeDefects,
  type AIAnalysisResult,
} from "../services/aiAnalysis";

type UseAIAnalysisReturn = {
  analysis: string;
  errorMessage: string;
  isAnalyzing: boolean;
  executeAnalysis: (
    prompt: string,
  ) => Promise<void>;
  clearAnalysis: () => void;
};

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [analysis, setAnalysis] =
    useState("");
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");
  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const executeAnalysis = async (
    prompt: string,
  ): Promise<void> => {
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const result: AIAnalysisResult =
        await analyzeDefects(prompt);

      setAnalysis(result.analysis);
    } catch (error) {
      console.error(
        "AI analysis failed:",
        error,
      );

      setAnalysis("");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AI分析中にエラーが発生しました。",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = (): void => {
    setAnalysis("");
    setErrorMessage("");
  };

  return {
    analysis,
    errorMessage,
    isAnalyzing,
    executeAnalysis,
    clearAnalysis,
  };
}