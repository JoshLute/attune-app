
import React from 'react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-gray-700 font-semibold mb-3 px-3">{title}</h2>
      <div className="space-y-2 rounded-lg bg-gray-50 p-2 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.8)]">
        {children}
      </div>
    </div>
  );
}
