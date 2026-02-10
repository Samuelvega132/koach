"use client";

import { Mail, Calendar } from "lucide-react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="glass-panel p-8 rounded-xl mb-8 border border-purple-500/30">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Miembro desde{" "}
                {new Date(user.createdAt).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
