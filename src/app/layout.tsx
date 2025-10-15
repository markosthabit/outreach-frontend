import type { Metadata } from "next";
import { Cairo } from 'next/font/google';
const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '700'] });

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";


export const metadata: Metadata = {
  title: "ذوقوا وإنظروا",
  description: "نظام متابعة المخدومين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className}>
        <AuthProvider>
        {children}
        </AuthProvider>

      </body>
    </html>
  );
}
