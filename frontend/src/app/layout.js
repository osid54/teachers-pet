import './globals.css';
import { Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from '@/context/AuthContext';
import ToastProvider from '@/components/layout/ToastProvider';
import Navbar from '@/components/layout/Navbar';

export default function AppLayout() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="w-full max-w-[1600px] mx-auto p-md min-[769px]:p-xl flex-grow mt-[90px]">
        <Outlet />
      </main>
      <ToastProvider />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}