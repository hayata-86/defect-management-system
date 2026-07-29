import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { signUp } from "aws-amplify/auth";
import {
  useState,
  type FormEvent,
} from "react";
import {
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

export function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        "メールアドレスを入力してください。",
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "パスワードを入力してください。",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "確認用パスワードが一致しません。",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp({
        username: trimmedEmail,
        password,
        options: {
          userAttributes: {
            email: trimmedEmail,
          },
        },
      });

      switch (
        result.nextStep.signUpStep
      ) {
        case "CONFIRM_SIGN_UP":
          navigate(
            "/register/confirm",
            {
              state: {
                email: trimmedEmail,
              },
            },
          );
          return;

        case "DONE":
          navigate("/login", {
            replace: true,
            state: {
              message:
                "新規登録が完了しました。ログインしてください。",
            },
          });
          return;

        case "COMPLETE_AUTO_SIGN_IN":
          setErrorMessage(
            "自動ログインの完了処理が必要です。",
          );
          return;

        default:
          setErrorMessage(
            "追加の登録操作が必要です。",
          );
      }
    } catch (error) {
      console.error(
        "ユーザー登録に失敗しました。",
        error,
      );

      const errorName =
        error instanceof Error
          ? error.name
          : "";

      switch (errorName) {
        case "UsernameExistsException":
          setErrorMessage(
            "このメールアドレスは既に登録されています。",
          );
          break;

        case "InvalidPasswordException":
          setErrorMessage(
            "パスワードが要件を満たしていません。",
          );
          break;

        case "InvalidParameterException":
          setErrorMessage(
            "入力内容が正しくありません。",
          );
          break;

        case "LimitExceededException":
        case "TooManyRequestsException":
          setErrorMessage(
            "試行回数が多すぎます。時間をおいて再度お試しください。",
          );
          break;

        default:
          setErrorMessage(
            "ユーザー登録に失敗しました。時間をおいて再度お試しください。",
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        backgroundColor:
          "background.default",
      }}
    >
      <Paper
        component="main"
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 450,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Stack spacing={3}>
          <Stack
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                backgroundColor:
                  "primary.main",
              }}
            >
              <LockOutlinedIcon />
            </Avatar>

            <Typography
              variant="h4"
              component="h1"
            >
              新規登録
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                textAlign: "center",
              }}
            >
              メールアドレスとパスワードを入力してください
            </Typography>
          </Stack>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            <Stack spacing={2}>
              <TextField
                id="register-email"
                label="メールアドレス"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />

              <TextField
                id="register-password"
                label="パスワード"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />

              <TextField
                id="register-confirm-password"
                label="確認用パスワード"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "登録中..."
                  : "登録"}
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
              underline="hover"
            >
              ログインはこちら
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}