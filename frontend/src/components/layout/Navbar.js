'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/components/layout/_navbar.module.scss';

export default function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <Link href="/" className={styles.logoImageLink}>
                        <Image
                            src="/images/teachers-pet-logo-white.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className={styles.logoImage}
                        />
                    </Link>
                    
                    <Link href="/" className={styles.logoText}>
                        <span className={styles.desktopText}>Teacher's Pet</span>
                        <span className={styles.mobileText}>TP</span>
                    </Link>
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
                        <li>
                            <Link href="/account" className={styles.navItem}>
                                Account
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}