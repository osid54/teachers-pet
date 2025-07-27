import '@/styles/globals.scss';

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { AuthProvider } from '@/context/AuthContext';
import ToastProvider from '@/components/layout/ToastProvider';

import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: "Teacher's Pet",
  description: "A simple worksheet generator.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="app-content">
            {children}
          </main>
          <ToastProvider />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
