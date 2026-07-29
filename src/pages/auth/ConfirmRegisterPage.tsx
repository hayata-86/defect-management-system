import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import { useState, type FormEvent } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

type LocationState = {
  email?: string;
};

export function ConfirmRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;

  const [email, setEmail] = useState(
    state?.email ?? "",
  );
  const [confirmationCode, setConfirmationCode] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isResending, setIsResending] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    const trimmedCode = confirmationCode.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        "メールアドレスを入力してください。",
      );
      return;
    }

    if (!trimmedCode) {
      setErrorMessage(
        "確認コードを入力してください。",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await confirmSignUp({
        username: trimmedEmail,
        confirmationCode: trimmedCode,
      });

      if (result.isSignUpComplete) {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "新規登録が完了しました。ログインしてください。",
          },
        });
        return;
      }

      setErrorMessage(
        "登録を完了できませんでした。確認コードをもう一度確認してください。",
      );
    } catch (error) {
      console.error(error);

      const errorName =
        error instanceof Error ? error.name : "";

      switch (errorName) {
        case "CodeMismatchException":
          setErrorMessage(
            "確認コードが正しくありません。",
          );
          break;

        case "ExpiredCodeException":
          setErrorMessage(
            "確認コードの有効期限が切れています。コードを再送してください。",
          );
          break;

        case "UserNotFoundException":
          setErrorMessage(
            "該当するユーザーが見つかりません。",
          );
          break;

        case "NotAuthorizedException":
          setErrorMessage(
            "このユーザーはすでに確認済みです。ログインしてください。",
          );
          break;

        case "TooManyFailedAttemptsException":
        case "LimitExceededException":
          setErrorMessage(
            "試行回数が多すぎます。しばらく待ってから再度お試しください。",
          );
          break;

        default:
          setErrorMessage(
            "確認処理に失敗しました。",
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        "確認コードを再送するメールアドレスを入力してください。",
      );
      return;
    }

    try {
      setIsResending(true);

      await resendSignUpCode({
        username: trimmedEmail,
      });

      setSuccessMessage(
        "確認コードを再送しました。メールを確認してください。",
      );
    } catch (error) {
      console.error(error);

      const errorName =
        error instanceof Error ? error.name : "";

      switch (errorName) {
        case "UserNotFoundException":
          setErrorMessage(
            "該当するユーザーが見つかりません。",
          );
          break;

        case "LimitExceededException":
        case "TooManyRequestsException":
          setErrorMessage(
            "再送回数が多すぎます。しばらく待ってから再度お試しください。",
          );
          break;

        default:
          setErrorMessage(
            "確認コードの再送に失敗しました。",
          );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 450,
        }}
      >
        <Stack spacing={3}>
            <Stack
                spacing={1}
                sx={{
                    alignItems: "center",
                }}
            >

            <Typography variant="h4">
              メールアドレス確認
            </Typography>

            <Typography
            variant="body2"
            color="text.secondary"
            sx={{
                textAlign: "center",
            }}
            >
              メールに届いた確認コードを入力してください。
            </Typography>
          </Stack>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success">
              {successMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Stack spacing={2}>
              <TextField
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={
                  isSubmitting || isResending
                }
                fullWidth
                required
              />

              <TextField
                label="確認コード"
                value={confirmationCode}
                onChange={(event) =>
                  setConfirmationCode(
                    event.target.value,
                  )
                }
                disabled={
                  isSubmitting || isResending
                }
                slotProps={{
                    htmlInput: {
                        inputMode: "numeric",
                        maxLength: 6,
                    },
                }}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                disabled={
                  isSubmitting || isResending
                }
                fullWidth
              >
                {isSubmitting
                  ? "確認中..."
                  : "登録を完了する"}
              </Button>

              <Button
                type="button"
                variant="text"
                onClick={handleResendCode}
                disabled={
                  isSubmitting || isResending
                }
              >
                {isResending
                  ? "再送中..."
                  : "確認コードを再送する"}
              </Button>
            </Stack>
          </Box>

          <Typography
            sx={{
                textAlign: "center",
            }}
            >
            <Link
              component={RouterLink}
              to="/login"
            >
              ログイン画面に戻る
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}