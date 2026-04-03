import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'DevXtreme | Pothole Management',
  description: 'AI-powered real-time pothole reporting and traveler alerting system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <div className="bg-glow" />
          <Navbar />
          <main className="pt-24 pb-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
