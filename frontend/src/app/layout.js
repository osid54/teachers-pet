import './globals.css';
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
      <body className="antialiased bg-main-200 min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="max-w-[1600px] mx-auto p-xl sm:p-md flex-grow mt-[90px]">
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