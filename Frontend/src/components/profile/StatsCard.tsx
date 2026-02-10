"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle: string;
}

export function StatsCard({ icon: Icon, iconColor, title, value, subtitle }: StatsCardProps) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}
