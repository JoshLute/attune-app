
import React from "react";

interface BehaviorEvent {
  tag: string;
  timestamp: number;
}

interface BehaviorSidebarProps {
  open: boolean;
  onClose: () => void;
  events: BehaviorEvent[];
  recordingTime: number;
}

export default function BehaviorSidebar({ open, onClose, events, recordingTime }: BehaviorSidebarProps) {
  // Convert seconds to min:sec format
  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div
      className={`
        fixed top-0 right-0 h-full w-[340px] max-w-full bg-white border-l border-gray-200 shadow-xl z-40 transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
      aria-label="Behavior Event Sidebar"
    >
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl transition-colors"
        onClick={onClose}
        aria-label="Close Sidebar"
      >
        ×
      </button>
      <div className="p-6 pb-2 bg-[hsl(var(--attune-purple),0.92)] rounded-tr-3xl">
        <h2 className="text-lg font-bold text-white">Behavior Timeline</h2>
        <p className="text-sm text-white/90 mt-1">
          Behaviors marked during this session.
        </p>
      </div>
      <div className="p-6 pt-4 overflow-y-auto h-[calc(100%-104px)]">
        <ul className="space-y-4">
          {events.length === 0 ? (
            <li className="text-gray-500 italic text-center mt-8">No behaviors tagged yet.</li>
          ) : (
            events.map((evt, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                <span className="text-[hsl(var(--attune-purple))] font-semibold">{evt.tag}</span>
                <span className="text-xs text-gray-600 px-2 py-0.5 bg-gray-100 rounded font-mono">
                  {formatTime(evt.timestamp)} / {formatTime(recordingTime)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
