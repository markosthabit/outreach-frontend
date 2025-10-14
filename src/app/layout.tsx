import type { Metadata } from "next";
import { Cairo } from 'next/font/google';
const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '700'] });

import "./globals.css";


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
    <html lang="en" dir="rtl">
      <body className={cairo.className}>{children}</body>
    </html>
  );
}
