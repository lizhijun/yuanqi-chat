import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import "./styles.css";

const comicNeue = Comic_Neue({ 
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "奇奇博士的科学乐园",
  description: "和奇奇博士一起探索科学的奥秘！适合6-12岁儿童的AI助手，让学习变得有趣！",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={comicNeue.className}>
        {children}
      </body>
    </html>
  );
}
