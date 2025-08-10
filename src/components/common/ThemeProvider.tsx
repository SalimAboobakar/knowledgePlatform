import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Theme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // التحقق من تفضيل المستخدم المحفوظ
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // التحقق من تفضيل النظام
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // حفظ التفضيل في localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = createTheme({
    direction: "ltr",
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#8b5cf6",
        light: "#a78bfa",
        dark: "#7c3aed",
        contrastText: "#ffffff",
      },
      background: {
        default: isDarkMode ? "#0f172a" : "#ffffff",
        paper: isDarkMode ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#f1f5f9" : "#1e293b",
        secondary: isDarkMode ? "#94a3b8" : "#64748b",
      },
      grey: isDarkMode
        ? {
            50: "#0f172a",
            100: "#1e293b",
            200: "#334155",
            300: "#475569",
            400: "#64748b",
            500: "#94a3b8",
            600: "#cbd5e1",
            700: "#e2e8f0",
            800: "#f1f5f9",
            900: "#ffffff",
          }
        : {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.5rem",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.125rem",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
      },
      body1: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 6,
            padding: "8px 16px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
          },
          contained: {
            background: "#3b82f6",
            "&:hover": {
              background: "#2563eb",
            },
          },
          outlined: {
            borderWidth: "1px",
            "&:hover": {
              borderWidth: "1px",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 6,
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
              "& fieldset": {
                borderColor: isDarkMode ? "#334155" : "#e2e8f0",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: isDarkMode ? "#475569" : "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#3b82f6",
                borderWidth: "1px",
              },
            },
            "& .MuiInputLabel-root": {
              color: isDarkMode ? "#94a3b8" : "#64748b",
              "&.Mui-focused": {
                color: "#3b82f6",
              },
            },
            "& .MuiInputBase-input": {
              color: isDarkMode ? "#f1f5f9" : "#1e293b",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: isDarkMode
                ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            minHeight: 40,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: "2px 2px 0 0",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            borderColor: isDarkMode ? "#334155" : "#e2e8f0",
            borderLeft: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            borderColor: isDarkMode ? "#334155" : "#e2e8f0",
            borderBottom: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
            color: isDarkMode ? "#f1f5f9" : "#1e293b",
            "&:hover": {
              backgroundColor: isDarkMode ? "#475569" : "#e2e8f0",
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: isDarkMode ? "#334155" : "#e2e8f0",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: "1px 4px",
            "&:hover": {
              backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: "1px 4px",
            "&:hover": {
              backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
            },
            "&.Mui-selected": {
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? "#334155" : "#e2e8f0",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            borderRadius: 6,
            "& .MuiInputBase-input": {
              color: isDarkMode ? "#f1f5f9" : "#1e293b",
              "&::placeholder": {
                color: isDarkMode ? "#94a3b8" : "#64748b",
                opacity: 1,
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
            "& fieldset": {
              borderColor: isDarkMode ? "#334155" : "#e2e8f0",
            },
            "&:hover fieldset": {
              borderColor: isDarkMode ? "#475569" : "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
            },
          },
        },
      },
    },
  });

  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
