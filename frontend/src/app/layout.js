import '@/styles/globals.scss';

import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: "Teacher&apos;s Pet",
  description: "A simple worksheet generator for teachers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-content">
          {children}
        </main>
      </body>
    </html>
  );
}
