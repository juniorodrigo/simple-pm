import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Systems Project Management",
	description: "Project management application for Systems department",
	generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<AuthProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<div className="flex h-screen overflow-hidden">
							<Sidebar />
							<div className="flex flex-col flex-1 overflow-hidden">
								<Header />
								<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
							</div>
						</div>
						<Toaster />
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}

import "./globals.css";
