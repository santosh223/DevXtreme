import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'DevXtreme | Pothole Management',
  description: 'Citizen pothole reporting and admin management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className={`glass ${styles.navbar}`}>
          <div className={`container ${styles.navContent}`}>
            <Link href="/" className={styles.brand}>
              <AlertCircle className={styles.brandIcon} />
              <span>DevXtreme</span>
            </Link>
            <div className={styles.navLinks}>
              <Link href="/report" className={styles.navLink}>
                Citizen Report
              </Link>
              <Link href="/admin" className={styles.navLink}>
                <ShieldAlert size={18} />
                Admin Dashboard
              </Link>
            </div>
          </div>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
      </body>
    </html>
  );
}
