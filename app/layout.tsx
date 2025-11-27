import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/contexts/ModalContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ModalWrapper from "@/components/ModalWrapper";
import ToastContainer from "@/components/ToastContainer";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "LykkeLoop - Budget-Friendly Earrings & Accessories",
  description: "Affordable, trendy earrings for everyday wear in Denmark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <ModalProvider>
              {children}
              <ModalWrapper />
              <ToastContainer />
            </ModalProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

