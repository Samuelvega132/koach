"use client";

import Link from "next/link";
import { Mic2, Music, BarChart3, Radio } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export const Navbar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Studio", href: "/", icon: Mic2 },
        { name: "Songs", href: "/songs", icon: Music },
        { name: "Results", href: "/results", icon: BarChart3 },
        { name: "Live", href: "/live", icon: Radio },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <nav className="flex items-center gap-1 p-2 rounded-full glass-panel shadow-2xl shadow-purple-900/20">
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
            </nav>
        </div>
    );
};
