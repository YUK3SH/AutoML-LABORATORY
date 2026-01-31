import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icons';

const UserMenu = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('automl_user') || '{"name": "User", "email": "user@example.com"}');
    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    // Toggle dropdown
    const toggleMenu = () => setIsOpen(!isOpen);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('automl_token');
        localStorage.removeItem('automl_user');
        navigate('/');
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-500 transition-colors focus:outline-none ring-2 ring-transparent focus:ring-cyan-400"
            >
                {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-white font-bold text-lg">{initials}</span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">

                    {/* Header with Large Avatar */}
                    <div className="p-6 flex flex-col items-center border-b border-gray-800 bg-black/20">
                        <div className="w-20 h-20 rounded-full bg-cyan-600 flex items-center justify-center mb-3 text-3xl font-bold text-white shadow-lg">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : initials}
                        </div>
                        <h3 className="text-white font-bold text-lg">{user.name}</h3>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button className="w-full text-left px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
                            <Icon name="settings" size={18} />
                            Settings
                        </button>
                        <button className="w-full text-left px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
                            <Icon name="creditCard" size={18} />
                            Billing
                        </button>
                    </div>

                    <div className="border-t border-gray-800 my-1"></div>

                    {/* Logout */}
                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-3 transition-colors font-medium"
                        >
                            <Icon name="logOut" size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
