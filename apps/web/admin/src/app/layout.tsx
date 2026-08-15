import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Team Duvidha — Sustainable Community Digital Twin Admin",
  description: "Authority Admin Dashboard for City Infrastructure & Environmental Incident Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
