'use client';

import { Link } from 'react-router-dom';

export default function Navbar() {
    const linkClasses = `text-main-100 text-sm font-medium rounded-md transition-all 
                        duration-200 ease-in-out font-sans p-xs min-[769px]:text-base min-[769px]:p-sm
                        hover:bg-main-100/20 hover:-translate-y-[1px] active:translate-y-0`
    return (
        <header className="bg-main-600 py-md shadow-md fixed top-0 left-0 right-0 z-1000 font-custom text-center">
            <div className="flex flex-row justify-center min-[769px]:justify-between items-center max-w-375 mx-auto px-md min-[769px]:px-xl">

                <div className="flex items-center justify-center gap-0 min-[769px]:gap-sm">
                    <Link to="/" className="leading-0">
                        <img
                            src="/images/teachers-pet-logo-white.png"
                            alt="Logo"
                            width={45}
                            height={45}
                            className="rounded-sm"
                        />
                    </Link>
                    <Link to="/" className="text-lg font-light text-main-100 no-underline min-[769px]:text-h3 min-[1025px]:text-h2">
                        <span className="inline">Teacher&apos;s Pet</span>
                    </Link>
                </div>
                <nav className="min-[769px]:ml-auto">
                    <ul className="flex items-center justify-center gap-sm min-[769px]:gap-lg">
                        <li>
                            <Link to="/" className={linkClasses}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/templates" className={linkClasses}>
                                Templates
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className={linkClasses}>
                                About
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}