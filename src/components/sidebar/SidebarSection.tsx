
import React from 'react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-gray-700 font-semibold mb-3 px-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
