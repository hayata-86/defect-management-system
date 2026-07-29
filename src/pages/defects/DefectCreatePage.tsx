import {
  Alert,
  Box,
  Breadcrumbs,
  Link,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

import { DefectForm } from "../../components/defects";
import { createDefect } from "../../services/defectService";
import type { DefectFormValues } from "../../types/defect";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function DefectCreatePage() {
  const navigate = useNavigate();

  const [isSuccessOpen, setIsSuccessOpen] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

 const handleSubmit = async (
    values: DefectFormValues,
  ) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await createMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/defects");
  };

  const handleSuccessClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSuccessOpen(false);
    navigate("/defects");
  };

  const handleErrorClose = () => {
    setErrorMessage(null);
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createDefect,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["defects"],
      });

      setIsSuccessOpen(true);
    },

    onError: (error) => {
      console.error(error);

      setErrorMessage(
        "登録に失敗しました。",
      );
    },
  });

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
          新規登録
        </Typography>
      </Breadcrumbs>

      <Box sx={{ marginBottom: 3 }}>
        <Typography
          variant="h3"
          component="h1"
        >
          不具合登録
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginTop: 0.5 }}
        >
          発生した不具合の情報を入力してください。
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          onClose={handleErrorClose}
          sx={{ marginBottom: 2 }}
        >
          {errorMessage}
        </Alert>
      )}

      <DefectForm
        submitLabel={
          isSubmitting ? "登録中..." : "登録"
        }
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <Snackbar
        open={isSuccessOpen}
        autoHideDuration={1500}
        onClose={handleSuccessClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleSuccessClose}
          sx={{ width: "100%" }}
        >
          不具合を登録しました。
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DefectCreatePage;