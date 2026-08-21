import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Near Now — Build Together",
  description: "The place where students discover what others are building and find their next opportunity to build something themselves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise">
        {children}
      </body>
    </html>
  );
}
