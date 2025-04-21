
import React from "react";
import { AlertTriangle, Activity, Eye } from "lucide-react";

interface AnalyticsItem {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

interface PartsToReviewSectionProps {
  analytics: AnalyticsItem[];
  attentionThreshold?: number;
  understandingThreshold?: number;
}

const getStatus = (attention: number, understanding: number, attentionThreshold: number, understandingThreshold: number) => {
  if (attention < attentionThreshold && understanding < understandingThreshold) return { label: "Low Attention & Understanding", icon: <AlertTriangle size={16} className="text-red-600" />, color: "border-red-200 bg-red-50" };
  if (attention < attentionThreshold) return { label: "Low Attention", icon: <Activity size={16} className="text-yellow-600" />, color: "border-yellow-200 bg-yellow-50" };
  if (understanding < understandingThreshold) return { label: "Low Understanding", icon: <AlertTriangle size={16} className="text-blue-600" />, color: "border-blue-200 bg-blue-50" };
  return { label: "Good", icon: <Eye size={16} className="text-green-600" />, color: "border-green-200 bg-green-50" };
};

export const PartsToReviewSection: React.FC<PartsToReviewSectionProps> = ({
  analytics,
  attentionThreshold = 60,
  understandingThreshold = 60,
}) => {
  // Filter for segments below thresholds
  const toReview = analytics.filter(
    a => a.attention < attentionThreshold || a.understanding < understandingThreshold
  );

  if (toReview.length === 0) {
    return (
      <div className="rounded-3xl p-6 bg-gray-50 shadow border border-purple-100 mt-1">
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-3">Parts to Review</h2>
        <div className="text-gray-700">No parts need review! 🎉</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow border border-purple-100 mt-1">
      <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-3">Parts to Review</h2>
      {toReview.map((item, idx) => {
        const status = getStatus(item.attention, item.understanding, attentionThreshold, understandingThreshold);
        return (
          <div key={idx} className={`mb-4 last:mb-0 p-4 rounded-xl border ${status.color} shadow-sm`}>
            <div className="flex items-center gap-2 mb-1">
              {status.icon}
              <span className="font-medium">{status.label}</span>
              <span className="ml-auto text-xs text-gray-500">{item.timestamp}</span>
            </div>
            <div className="mb-1 flex gap-4 text-xs text-gray-600">
              <span>Attention: <span className={item.attention < attentionThreshold ? "font-bold text-yellow-700" : ""}>{item.attention}%</span></span>
              <span>Understanding: <span className={item.understanding < understandingThreshold ? "font-bold text-blue-700" : ""}>{item.understanding}%</span></span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">What was missed: </span>
              {item.transcript}
            </div>
          </div>
        );
      })}
    </div>
  );
};
