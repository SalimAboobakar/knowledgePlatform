import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./components/common/ThemeProvider";
import { useAuth } from "./hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";
// import { initializeFirebaseData } from "./services/firebaseService";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // النظام يعمل مع البيانات الحقيقية من Firebase

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
