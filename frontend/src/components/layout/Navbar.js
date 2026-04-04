'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const linkClasses = `text-main-100 text-sm font-medium rounded-md transition-all 
                        duration-200 ease-in-out font-sans p-xs sm:text-base sm:p-sm
                        hover:bg-main-100/20 hover:-translate-y-[1px] active:translate-y-0`
    return (
        <header className="bg-main-600 py-md shadow-md fixed top-0 left-0 right-0 z-1000 font-custom text-center">
            <div className="flex flex-row justify-between items-center max-w-375 mx-auto px-xs sm:px-xl">

                <div className="flex items-center justify-center gap-0 sm:gap-sm">
                    <Link href="/" className="leading-0">
                        <Image
                            src="/images/teachers-pet-logo-white.png"
                            alt="Logo"
                            width={45}
                            height={45}
                            className="rounded-sm sm:w-15 sm:h-15"
                        />
                    </Link>
                    <Link href="/" className="text-lg font-light text-main-100 no-underline sm:text-h2 md:text-h3">
                        <span className="inline">Teacher&apos;s Pet</span>
                    </Link>
                </div>
                <nav className="sm:ml-auto">
                    <ul className="flex items-center justify-center gap-xxs sm:gap-lg">
                        <li>
                            <Link href="/" className={linkClasses}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/templates" className={linkClasses}>
                                Templates
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className={linkClasses}>
                                About
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}