import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Rubik, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cycorgi - GRC Platform",
  description: "Governance, Risk, and Compliance platform powered by Cycorgi",
  icons: {
    icon: [
      { url: '/angry-corgi.png', type: 'image/png' }
    ],
    shortcut: '/angry-corgi.png',
    apple: '/angry-corgi.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} ${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-poppins`}
      >
        {children}
      </body>
    </html>
  );
}
