import React from 'react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-darkpanel py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
                    {children}
                </div>
            </div>
        </div>
    );
}
