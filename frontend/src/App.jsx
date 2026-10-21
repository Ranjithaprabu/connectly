import { useState } from "react";

import AuthScreen from "./components/AuthScreen";
import ChatApp from "./components/ChatApp";

import "./App.css";



function App() {
  const [session, setSession] = useState(() => {
    try {
      const token = localStorage.getItem("connectly_token");
      const user = localStorage.getItem("connectly_user");

      return token && user ? { token, user: JSON.parse(user) } : null;
    } catch {
      return null;
    }
  });

  function handleLogin(data) {
    if (!data.token || !data.user) {
      console.error("Authentication response is missing token or user.");
      return;
    }

    localStorage.setItem("connectly_token", data.token);
    localStorage.setItem("connectly_user", JSON.stringify(data.user));
    setSession({ token: data.token, user: data.user });
  }

  function handleLogout() {
    localStorage.removeItem("connectly_token");
    localStorage.removeItem("connectly_user");
    setSession(null);
  }

  return session ? (
    <ChatApp session={session} onLogout={handleLogout} />
  ) : (
    <AuthScreen onLogin={handleLogin} />
  );
}

export default App;
