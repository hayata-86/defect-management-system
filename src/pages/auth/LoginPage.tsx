import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { signIn } from "aws-amplify/auth";
import { useAuth } from "../../contexts/AuthContext";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

type LoginLocationState = {
  message?: string;
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
  location.state as LoginLocationState | null;

  const redirectPath =
  locationState?.from ?? "/";

  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    locationState?.message ?? "",
  );

  const {
  isAuthenticated,
  isLoading,
  checkAuth,
} = useAuth();

  useEffect(() => {
    if (locationState?.message) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [
    location.pathname,
    locationState?.message,
    navigate,
  ]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
  ]);

  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    rememberLogin,
    setRememberLogin,
  ] = useState(false);
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
  setSuccessMessage("");

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

    try {
      setIsSubmitting(true);

      const result = await signIn({
        username: trimmedEmail,
        password,
      });

      console.log("signIn result:", result);

      if (result.isSignedIn) {
        // AuthContextを更新
        await checkAuth();

        console.log("認証成功");

        navigate(redirectPath, {
          replace: true,
        });

        return;
      }

      switch (
        result.nextStep.signInStep
      ) {
        case "CONFIRM_SIGN_UP":
          setErrorMessage(
            "メールアドレスの確認が完了していません。",
          );
          break;

        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
          setErrorMessage(
            "初回ログイン用パスワードの変更が必要です。",
          );
          break;

        case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
        case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
        case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE":
          setErrorMessage(
            "確認コードの入力が必要です。",
          );
          break;

        case "RESET_PASSWORD":
          setErrorMessage(
            "パスワードの再設定が必要です。",
          );
          break;

        default:
          setErrorMessage(
            "追加の認証操作が必要です。",
          );
      }
    } catch (error) {
      console.error(
        "ログインに失敗しました。",
        error,
      );

      const errorName =
        error instanceof Error
          ? error.name
          : "";

      switch (errorName) {
        case "UserNotFoundException":
        case "NotAuthorizedException":
          setErrorMessage(
            "メールアドレスまたはパスワードが正しくありません。",
          );
          break;

        case "UserNotConfirmedException":
          setErrorMessage(
            "メールアドレスの確認が完了していません。",
          );
          break;

        case "PasswordResetRequiredException":
          setErrorMessage(
            "パスワードの再設定が必要です。",
          );
          break;

        case "TooManyRequestsException":
          setErrorMessage(
            "試行回数が多すぎます。時間をおいて再度お試しください。",
          );
          break;

        case "UserAlreadyAuthenticatedException":
          await checkAuth();

          navigate(redirectPath, {
            replace: true,
          });
          break;

        default:
          setErrorMessage(
            "ログインに失敗しました。時間をおいて再度お試しください。",
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
        padding: 3,
        backgroundColor:
          "background.default",
      }}
    >
      <Paper
        component="main"
        sx={{
          width: "100%",
          maxWidth: 440,
          padding: 4,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Stack spacing={3}>
          <Stack
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
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
              不具合管理システム
            </Typography>

            <Typography color="text.secondary">
              アカウント情報を入力してログインしてください
            </Typography>
          </Stack>

          {successMessage && (
            <Alert severity="success">
              {successMessage}
            </Alert>
          )}

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
            <Stack spacing={2.5}>
              <TextField
                id="email"
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
              />

              <TextField
                id="password"
                label="パスワード"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
              />

              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        rememberLogin
                      }
                      onChange={(event) =>
                        setRememberLogin(
                          event.target
                            .checked,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                    />
                  }
                  label="ログイン状態を保持する"
                />

                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  disabled={isSubmitting}
                  onClick={() => {
                    console.log(
                      "パスワード再設定",
                    );
                  }}
                >
                  パスワードを忘れた場合
                </Link>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  mt: 2,
                }}
              >
                アカウントをお持ちでない方は{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                >
                  新規登録
                </Link>
              </Typography>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "ログイン中..."
                  : "ログイン"}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
            }}
          >
            Amazon Cognitoで認証します
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}