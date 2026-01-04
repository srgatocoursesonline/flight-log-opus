import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { StatusBar } from "./StatusBar";
import ErrorBoundary from "@/components/ErrorBoundary";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background mobile-scroll-smooth">
      <StatusBar />
      <div className="flex">
        <Navigation />
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-12 mobile-bottom-nav-padding mobile-safe-area">
          <div className="mobile-container">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};