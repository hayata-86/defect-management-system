import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#1976d2",
    },

    secondary: {
      main: "#455a64",
    },

    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },

    error: {
      main: "#d32f2f",
    },

    warning: {
      main: "#ed6c02",
    },

    success: {
      main: "#2e7d32",
    },
  },

  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Yu Gothic"',
      '"Meiryo"',
      "sans-serif",
    ].join(","),

    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },

    h2: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },

    h3: {
      fontSize: "1.5rem",
      fontWeight: 700,
    },

    h4: {
      fontSize: "1.25rem",
      fontWeight: 700,
    },

    h5: {
      fontSize: "1.125rem",
      fontWeight: 700,
    },

    h6: {
      fontSize: "1rem",
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  shape: {
    borderRadius: 8,
  },

  spacing: 8,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minWidth: 1200,
          backgroundColor: "#f5f7fa",
        },

        "*": {
          boxSizing: "border-box",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 6,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
        fullWidth: true,
      },
    },

    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },

      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: "#f0f3f7",
          whiteSpace: "nowrap",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});
