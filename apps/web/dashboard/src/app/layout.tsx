import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MOCK_ORGANIZATION_NAME } from "@/data/mock-dashboard-data";

export const metadata: Metadata = {
  title: "Municipal Authority Dashboard — Sustainable Community Digital Twin",
  description: "Municipal Authority Dashboard for reviewing citizen reports and verified sustainability impact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar organizationName={MOCK_ORGANIZATION_NAME} />
          <div className="main-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
