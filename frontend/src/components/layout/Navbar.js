'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/components/layout/_navbar.module.scss';

export default function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <Link href="/" className={styles.logoText}>
                        Teacher's Pet
                    </Link>

                    {/*
          <Link href="/" className={styles.logoImageLink}>
            <Image
              src="/teachers-pet-logo.png" // Path to your logo in public/
              alt="Teacher's Pet Logo"
              width={40} // Adjust width as needed
              height={40} // Adjust height as needed
              className={styles.logoImage}
            />
          </Link>
          */}
                </div>

                <nav className={styles.navLinks}>
                    <ul>
                        <li>
                            <Link href="/" className={styles.navItem}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className={styles.navItem}>
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className={styles.navItem}>
                                Contact
                            </Link>
                        </li>
                        {/* Future: User Account Link */}
                        {/* <li>
              <Link href="/account" className={styles.navItem}>
                Account
              </Link>
            </li> */}
                    </ul>
                </nav>
            </div>
        </header>
    );
}