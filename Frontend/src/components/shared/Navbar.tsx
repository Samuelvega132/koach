"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic2, Music, BarChart3, Radio, LogIn, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

export const Navbar = () => {
    const pathname = usePathname();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Close dropdown when route changes
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [pathname]);

    const navItems = [
        { name: "Studio", href: "/", icon: Mic2 },
        { name: "Songs", href: "/songs", icon: Music },
        { name: "Results", href: "/results", icon: BarChart3 },
        { name: "Live", href: "/live", icon: Radio },
    ];

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    return (
        <>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-1 p-2 rounded-full glass-panel shadow-2xl shadow-purple-900/20">
                    {/* Navigation Items */}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "relative flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 group",
                                    isActive
                                        ? "text-white bg-white/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={clsx("w-5 h-5", isActive && "text-purple-400")} />
                                <span className={clsx(
                                    "overflow-hidden transition-all duration-300 text-sm font-medium ml-2",
                                    isActive ? "w-auto opacity-100" : "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2"
                                )}>
                                    {item.name}
                                </span>

                                {/* Active Indicator (Dot) */}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* Auth Section */}
                    {!isLoading && (
                        <>
                            {!isAuthenticated ? (
                                /* Guest Mode - Login Button */
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span className="text-sm font-medium overflow-hidden transition-all duration-300 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-0">
                                        Iniciar Sesión
                                    </span>
                                </button>
                            ) : (
                                /* Authenticated Mode - User Dropdown */
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-white/10 hover:bg-white/15 transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-sm font-bold">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium hidden md:inline">
                                            {user?.firstName}
                                        </span>
                                        <ChevronDown className={clsx(
                                            "w-4 h-4 transition-transform duration-200",
                                            isDropdownOpen && "rotate-180"
                                        )} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            
                                            {/* Menu */}
                                            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-lg shadow-2xl shadow-purple-900/30 overflow-hidden z-50">
                                                <div className="p-3 border-b border-white/10">
                                                    <p className="text-sm font-medium text-white">
                                                        {user?.firstName} {user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                                
                                                <div className="p-2">
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <UserIcon className="w-4 h-4" />
                                                        <span className="text-sm">Mi Perfil</span>
                                                    </Link>
                                                    
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span className="text-sm">Cerrar Sesión</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </nav>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};
