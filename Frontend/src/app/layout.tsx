import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/shared/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KOACH | Intelligent Vocal Studio",
  description: "AI-Powered Singing Coach with Real-time Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground overflow-x-hidden`}>
        <AuthProvider>
          {/* Background Gradients */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
          </div>

          <Navbar />

          <main className="relative pt-24 px-4 pb-10 max-w-7xl mx-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
