import type { Metadata } from "next";
import { Archivo, Sometype_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import AuthWrapper from "@/components/auth/AuthWrapper";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const sometypeMono = Sometype_Mono({
  variable: "--font-sometype-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rhino Air Partner Portal",
  description: "For Rhino Air GC & developer partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${sometypeMono.variable} antialiased`}
      >
        <StoreProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
