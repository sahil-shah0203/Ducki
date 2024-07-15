import "~/styles/globals.css"; // Unified import path
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import AuthWrapper from "./_components/AuthWrapper";

export const metadata = {
  title: "ducki",
  description: "AI Tutor",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="flex min-h-screen w-full flex-col">
          <TRPCReactProvider>
            <div className="flex w-full flex-1 flex-col">
              <AuthWrapper>{children}</AuthWrapper>
            </div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
