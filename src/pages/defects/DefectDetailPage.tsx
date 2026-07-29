import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  PriorityChip,
  StatusChip,
} from "../../components/defects";
import {
  deleteDefect,
  getDefect,
} from "../../services/defectService";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

type DetailItemProps = {
  label: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
};

function DetailItem({
  label,
  children,
  fullWidth = false,
}: 

DetailItemProps) {

  return (
    <Box
      sx={{
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginBottom: 0.75 }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          minHeight: 32,
          display: "flex",
          alignItems: "center",
        }}
      >
        {typeof children === "string" ? (
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: 1.8,
            }}
          >
            {children.trim() || "－"}
          </Typography>
        ) : (
          children ?? (
            <Typography color="text.secondary">
              －
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
}

type DetailSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function DetailSection({
  title,
  description,
  children,
}: DetailSectionProps) {
  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 700,
          marginBottom: 0.5,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 2 }}
        >
          {description}
        </Typography>
      )}

      {children}
    </Box>
  );
}

export function DefectDetailPage() {
  const navigate = useNavigate();

  const { defectId } = useParams<{
    defectId: string;
  }>();

  const {
    data: defect,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["defects", defectId],
    queryFn: () => getDefect(defectId!),
    enabled: Boolean(defectId),
  });

  const [errorMessage, setErrorMessage] =
  useState("");

  const [
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  ] = useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const handleBack = () => {
    navigate("/defects");
  };

  const handleEdit = () => {
    if (!defect) {
      return;
    }

    navigate(`/defects/${defect.id}/edit`);
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteDefect,

    onSuccess: async () => {
      // 一覧を最新化
      await queryClient.invalidateQueries({
        queryKey: ["defects"],
      });

      navigate("/defects");
    },

    onError: (error) => {
      console.error(
        "不具合の削除に失敗しました。",
        error,
      );

      setErrorMessage(
        "不具合の削除に失敗しました。時間をおいて再度お試しください。",
      );

      setIsDeleteDialogOpen(false);
    },
  });

  const handleDeleteDialogOpen = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteDialogOpen(false);
  };

const handleDelete = async () => {
    if (!defectId) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteMutation.mutateAsync(
        defectId,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
      </Alert>
    );
  }

  if (!defect) {
    return (
      <Box>
        <Breadcrumbs
          aria-label="パンくずリスト"
          sx={{ marginBottom: 3 }}
        >
          <Link
            component={RouterLink}
            to="/defects"
            underline="hover"
            color="inherit"
          >
            不具合一覧
          </Link>

          <Typography color="text.primary">
            詳細
          </Typography>
        </Breadcrumbs>

        <Alert severity="error">
          {errorMessage ||
            "指定された不具合が見つかりません。"}
        </Alert>

        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ marginTop: 3 }}
        >
          不具合一覧へ戻る
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs
        aria-label="パンくずリスト"
        sx={{ marginBottom: 2 }}
      >
        <Link
          component={RouterLink}
          to="/defects"
          underline="hover"
          color="inherit"
        >
          不具合一覧
        </Link>

        <Typography color="text.primary">
          不具合No.{defect.id}
        </Typography>
      </Breadcrumbs>

      {errorMessage && (
        <Alert
          severity="error"
          onClose={() =>
            setErrorMessage("")
          }
          sx={{ marginBottom: 2 }}
        >
          {errorMessage}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
          >
            不具合詳細
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 0.5 }}
          >
            登録されている不具合の内容を確認します。
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleBack}
          >
            一覧へ戻る
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteDialogOpen}
          >
            削除
          </Button>

          <Button
            variant="contained"
            onClick={handleEdit}
          >
            編集
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          padding: {
            xs: 2,
            md: 4,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {/* 基本情報 */}
        <DetailSection title="基本情報">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            <DetailItem label="不具合ID">
              {defect.id}
            </DetailItem>

            <DetailItem label="プロジェクト名">
              {defect.projectName}
            </DetailItem>

            <DetailItem label="タイトル" fullWidth>
              {defect.title}
            </DetailItem>

            <DetailItem label="担当者">
              {defect.assignee}
            </DetailItem>

            <DetailItem label="ステータス">
              <StatusChip status={defect.status} />
            </DetailItem>

            <DetailItem label="優先度">
              <PriorityChip priority={defect.priority} />
            </DetailItem>

            <DetailItem label="発生日">
              {defect.occurredAt}
            </DetailItem>

            <DetailItem label="対応期限">
              {defect.dueDate}
            </DetailItem>

            <DetailItem label="登録日">
              {defect.registeredAt}
            </DetailItem>

            <DetailItem label="更新日">
              {defect.updatedAt}
            </DetailItem>
          </Box>
        </DetailSection>

        <Divider sx={{ marginY: 4 }} />

        {/* 不具合内容 */}
        <DetailSection
          title="不具合内容"
          description="発生した不具合の現象や状況を記載します。"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 3,
            }}
          >
            <DetailItem label="不具合内容" fullWidth>
              {defect.description}
            </DetailItem>
          </Box>
        </DetailSection>

        <Divider sx={{ marginY: 4 }} />

        {/* 原因分析 */}
        <DetailSection
          title="原因分析"
          description="不具合が発生した直接的な原因と、原因を生み出した背景を整理します。"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 3,
            }}
          >
            <DetailItem label="不具合原因" fullWidth>
              {defect.cause}
            </DetailItem>

            <DetailItem label="真因" fullWidth>
              {defect.rootCause}
            </DetailItem>
          </Box>
        </DetailSection>

        <Divider sx={{ marginY: 4 }} />

        {/* 対策 */}
        <DetailSection
          title="対策"
          description="同じ不具合を再発させないための対策と、その確認方法を記載します。"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 3,
            }}
          >
            <DetailItem label="再発防止策" fullWidth>
              {defect.countermeasure}
            </DetailItem>

            <DetailItem label="確認方法" fullWidth>
              {defect.verificationMethod}
            </DetailItem>

            <DetailItem label="実施タイミング" fullWidth>
              {defect.implementationTiming}
            </DetailItem>
          </Box>
        </DetailSection>

        <DetailSection title="分析情報">
          <DetailItem label="原因分類">
            {defect.causeCategory || "－"}
          </DetailItem>

          <DetailItem label="再発不具合">
            {defect.isRecurrence ? "はい" : "いいえ"}
          </DetailItem>

          <DetailItem label="関連不具合ID">
            {defect.isRecurrence
              ? defect.relatedDefectId || "－"
              : "対象なし"}
          </DetailItem>

          <DetailItem label="完了日">
            {defect.completedAt || "－"}
          </DetailItem>
        </DetailSection>
      </Paper>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          不具合の削除
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            不具合No.{defect.id}
            「{defect.title}」を削除します。
            この操作は取り消せません。よろしいですか？
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={isDeleting}
          >
            キャンセル
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={
              isDeleting ||
              deleteMutation.isPending
            }
          >
            {deleteMutation.isPending
              ? "削除中..."
              : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DefectDetailPage;