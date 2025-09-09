import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { UserProvider } from "./contexts/UserContext";
import Navbar from "./components/Home/Navbar";
import AppRouter from "./AppRouter";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <UserProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navbar />
              <AppRouter />
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                  },
                }}
              />
            </div>
          </UserProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
