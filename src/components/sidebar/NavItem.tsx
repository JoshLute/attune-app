
import React from 'react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

export function NavItem({ icon, label, href = "/", isActive = false }: NavItemProps) {
  return (
    <Link to={href} className={cn(
      "flex items-center py-2 px-3 rounded-md my-1 transition-colors",
      isActive ? "bg-[hsl(var(--attune-light-purple))] text-white" : "text-gray-700 hover:bg-gray-100"
    )}>
      <div className="text-[hsl(var(--attune-purple))]">
        {icon}
      </div>
      <span className="ml-3 text-sm font-medium">{label}</span>
    </Link>
  );
}
