import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { ThreadProvider } from "./context/ThreadContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = "838357512579-1eqjq25ajfcg1b0jh0chlrqung75u2bb.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
    <AuthProvider>
      <UserProvider>
        <ThreadProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThreadProvider>
      </UserProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
