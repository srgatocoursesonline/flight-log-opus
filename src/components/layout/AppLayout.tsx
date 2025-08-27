import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { StatusBar } from "./StatusBar";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <StatusBar />
      <div className="flex">
        <Navigation />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};