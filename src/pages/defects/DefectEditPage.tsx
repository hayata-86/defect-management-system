import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Link,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import { DefectForm } from "../../components/defects";
import {
  getDefect,
  updateDefect,
} from "../../services/defectService";
import type { DefectFormValues } from "../../types/defect";

export function DefectEditPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { defectId } = useParams<{
    defectId: string;
  }>();

  const [open, setOpen] =
    useState(false);

  const [updateError, setUpdateError] =
    useState("");

  /**
   * 編集対象の不具合情報を取得する
   */
  const {
    data: defect,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["defects", defectId],
    queryFn: () => getDefect(defectId!),
    enabled: Boolean(defectId),
  });

  /**
   * 不具合情報を更新する
   */
  const updateMutation = useMutation({
    mutationFn: (
      values: DefectFormValues,
    ) => {
      if (!defectId) {
        throw new Error(
          "不具合IDが取得できません。",
        );
      }

      return updateDefect(
        defectId,
        values,
      );
    },

    onSuccess: async (updatedDefect) => {
      /**
       * 一覧情報を無効化し、
       * 次回表示時に再取得させる
       */
      await queryClient.invalidateQueries({
        queryKey: ["defects"],
      });

      /**
       * 詳細画面用のキャッシュを
       * 更新後の情報で上書きする
       */
      queryClient.setQueryData(
        ["defects", defectId],
        updatedDefect,
      );

      setOpen(true);
    },

    onError: (error) => {
      console.error(
        "不具合の更新に失敗しました。",
        error,
      );

      setUpdateError(
        "更新に失敗しました。時間をおいて再度お試しください。",
      );
    },
  });

  /**
   * 更新処理を実行する
   */
  const handleSubmit = async (
    values: DefectFormValues,
  ) => {
    setUpdateError("");

    await updateMutation.mutateAsync(
      values,
    ).catch(() => {
      // エラー表示はuseMutationの
      // onErrorで行う
    });
  };

  /**
   * 更新完了メッセージを閉じて
   * 詳細画面へ遷移する
   */
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);

    navigate(`/defects/${defectId}`);
  };

  /**
   * 編集をキャンセルして
   * 詳細画面へ戻る
   */
  const handleCancel = () => {
    navigate(`/defects/${defectId}`);
  };

  if (!defectId) {
    return (
      <Alert severity="error">
        不具合IDが指定されていません。
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        不具合情報の取得に失敗しました。
        json-serverが起動しているか確認してください。
      </Alert>
    );
  }

  if (!defect) {
    return (
      <Alert severity="error">
        指定された不具合は存在しません。
      </Alert>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/defects"
        >
          不具合一覧
        </Link>

        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={`/defects/${defect.id}`}
        >
          詳細
        </Link>

        <Typography color="text.primary">
          編集
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="h3"
        sx={{ mb: 3 }}
      >
        不具合編集
      </Typography>

      {updateError && (
        <Alert
          severity="error"
          onClose={() =>
            setUpdateError("")
          }
          sx={{ mb: 2 }}
        >
          {updateError}
        </Alert>
      )}

      <DefectForm
        submitLabel={
          updateMutation.isPending
            ? "更新中..."
            : "更新"
        }
        defaultValues={{
          title: defect.title,
          projectName:
            defect.projectName,
          assignee: defect.assignee,
          status: defect.status,
          priority: defect.priority,
          occurredAt:
            defect.occurredAt,
          dueDate: defect.dueDate,
          description:
            defect.description,

          cause: defect.cause ?? "",
          rootCause: defect.rootCause ?? "",
          countermeasure: defect.countermeasure ?? "",
          verificationMethod: defect.verificationMethod ?? "",
          implementationTiming: defect.implementationTiming ?? "",

          causeCategory:
            defect.causeCategory ?? "",
          isRecurrence:
            defect.isRecurrence ?? false,
          relatedDefectId:
            defect.relatedDefectId ?? "",
          completedAt:
            defect.completedAt ?? "",
                }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          更新しました。
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DefectEditPage;