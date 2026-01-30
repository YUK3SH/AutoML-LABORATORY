import React from 'react';

export default function Card({ title, children, footer, className = '', noPadding = false }) {
    return (
        <div className={`bg-white dark:bg-darkpanel border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
            )}
            <div className={noPadding ? '' : 'px-6 py-5'}>
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    {footer}
                </div>
            )}
        </div>
    );
}
