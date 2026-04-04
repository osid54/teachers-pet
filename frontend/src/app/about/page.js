'use client';

import React from 'react';

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center p-xl text-center max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-main-700 mb-lg">
                About Teacher&apos;s Pet
            </h1>

            <div className="bg-main-100 rounded-lg p-lg shadow-md w-full">
                <p className="text-base text-main-500 mb-md leading-relaxed">
                    Teacher&apos;s Pet is a custom worksheet generation platform designed to bridge the gap
                    between complex mathematical concepts and classroom-ready materials.
                    Built with **Next.js 15** and **FastAPI**, it allows for high-precision arithmetic
                    customization for students of all levels.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-xl text-left">
                    <div className="border-l-4 border-main-500 pl-md">
                        <h3 className="text-lg font-semibold text-main-600">The Mission</h3>
                        <p className="text-sm text-main-500 mt-xs">
                            To empower educators with tools that generate unlimited practice problems,
                            tailored to specific pedagogical needs like decimal alignment and negative number introduction.
                        </p>
                    </div>
                    <div className="border-l-4 border-main-500 pl-md">
                        <h3 className="text-lg font-semibold text-main-600">The Technology</h3>
                        <p className="text-sm text-main-500 mt-xs">
                            Utilizing a Python-based backend for algorithmic problem generation and
                            ReportLab for professional-grade PDF rendering.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}