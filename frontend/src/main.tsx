import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { store } from "./store/store";
import AuthInitializer from "./components/auth/AuthInitializer";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthInitializer>
              <SocketProvider>
                <App />
              </SocketProvider>
            </AuthInitializer>
          </ThemeProvider>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "12px",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid #1e293b",
                boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.3)",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#0f172a",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f43f5e",
                  secondary: "#0f172a",
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
