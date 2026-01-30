import React from 'react';

export default function Input({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    helperText,
    name,
    required = false
}) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`block w-full rounded-md shadow-sm sm:text-sm py-2 px-3
          ${error
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    }
        `}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {!error && helperText && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
        </div>
    );
}
