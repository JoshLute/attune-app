
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
      "flex items-center py-3 px-4 rounded-xl my-2 transition-all duration-200",
      isActive 
        ? "bg-white text-[hsl(var(--attune-purple))] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)]" 
        : "bg-gray-50 text-gray-700 shadow-[5px_5px_10px_rgba(0,0,0,0.05),_-5px_-5px_10px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)] hover:translate-y-[-2px]"
    )}>
      <div className={cn(
        "text-[hsl(var(--attune-purple))]",
        isActive ? "text-opacity-100" : "text-opacity-80"
      )}>
        {icon}
      </div>
      <span className={cn(
        "ml-3 text-sm font-medium",
        isActive ? "font-semibold" : ""
      )}>
        {label}
      </span>
    </Link>
  );
}
