
import React from 'react';

interface ProfileSectionProps {
  name: string;
  avatarUrl: string;
}

export function ProfileSection({ name, avatarUrl }: ProfileSectionProps) {
  return (
    <div className="mt-auto bg-[hsl(var(--attune-light-purple))] rounded-xl p-3 flex items-center">
      <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center">
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="ml-3">
        <h3 className="text-white text-sm font-semibold">{name}</h3>
        <div className="flex items-center">
          <span className="text-xs text-white/80">Settings | Log Out</span>
        </div>
      </div>
    </div>
  );
}
