import '~/styles/globals.css';  // Unified import path
import { GeistSans } from 'geist/font/sans';
import { TRPCReactProvider } from '~/trpc/react';
import { ClerkProvider } from '@clerk/nextjs';
import Header from './_components/Header';
import AuthWrapper from './_components/AuthWrapper';

export const metadata = {
  title: "ducki",
  description: "Generated by create-t3-app",
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
        <body className="min-h-screen w-full flex flex-col">
          <TRPCReactProvider>
            <div id="__next" className="flex flex-1 flex-col w-full">
              <Header /> {/* Include the Header component */}
              <AuthWrapper>{children}</AuthWrapper> {/* Include AuthWrapper */}
            </div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
