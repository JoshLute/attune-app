
import React from 'react';
import { getStatusStyles, StatusIcon } from '@/utils/statusHelpers';
import { LessonSegment } from '@/types/analytics';

interface LessonOutlineCardProps {
  item: LessonSegment;
}

export const LessonOutlineCard = ({ item }: LessonOutlineCardProps) => {
  const statusStyles = getStatusStyles(item.status);
  
  return (
    <div className={`mb-3 rounded-xl p-3 border ${statusStyles} shadow-[2px_2px_5px_rgba(0,0,0,0.08),_-2px_-2px_5px_rgba(255,255,255,0.8)]`}>
      <div className="flex items-center gap-2 mb-1">
        <StatusIcon status={item.status} />
        <h3 className="font-medium">{item.topic}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
      <p className="text-sm">{item.transcript}</p>
    </div>
  );
};

export default LessonOutlineCard;
