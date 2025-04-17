
import { Eye, AlertTriangle, Activity } from 'lucide-react';
import React from 'react';

// Helper to determine the status background colors in neumorphic style
export const getStatusStyles = (status: string) => {
  switch (status) {
    case 'attentive':
      return "bg-green-100 text-green-700 border-green-200";
    case 'confused':
      return "bg-red-100 text-red-700 border-red-200";
    case 'inattentive':
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Helper to determine the status icon
export const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'attentive':
      return <Eye size={16} className="text-green-600" />;
    case 'confused':
      return <AlertTriangle size={16} className="text-red-600" />;
    case 'inattentive':
      return <Activity size={16} className="text-yellow-600" />;
    default:
      return null;
  }
};
