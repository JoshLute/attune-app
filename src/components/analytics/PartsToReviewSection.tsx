
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
  className?: string;
}

const getStatus = (
  attention: number,
  understanding: number,
  attentionThreshold: number,
  understandingThreshold: number
) => {
  if (attention < attentionThreshold && understanding < understandingThreshold)
    return {
      label: "Low Attention & Understanding",
      icon: <AlertTriangle size={18} className="text-red-500" />,
      color: "bg-[#FFDEE2] border-[#ea384c] shadow-[0_6px_30px_-8px_rgba(234,56,76,0.12)]",
      pill: "bg-red-400/80 text-white"
    };
  if (attention < attentionThreshold)
    return {
      label: "Low Attention",
      icon: <Activity size={18} className="text-yellow-600" />,
      color: "bg-[#FFF5DC] border-[#ffe19d] shadow-[0_6px_24px_-8px_rgba(253,202,87,0.14)]",
      pill: "bg-yellow-400/90 text-gray-900"
    };
  if (understanding < understandingThreshold)
    return {
      label: "Low Understanding",
      icon: <AlertTriangle size={18} className="text-blue-700" />,
      color: "bg-[#D3E4FD] border-[#4B7BEC] shadow-[0_6px_30px_-8px_rgba(75,123,236,0.13)]",
      pill: "bg-blue-400/80 text-white"
    };
  return {
    label: "Good",
    icon: <Eye size={18} className="text-green-600" />,
    color: "bg-[#ddfbec] border-[#47d58f] shadow-[0_6px_18px_-8px_rgba(71,213,143,0.11)]",
    pill: "bg-green-400/90 text-white"
  };
};

export const PartsToReviewSection: React.FC<PartsToReviewSectionProps> = ({
  analytics,
  attentionThreshold = 60,
  understandingThreshold = 60,
  className = ""
}) => {
  // Filter for segments below thresholds
  const toReview = analytics.filter(
    a => a.attention < attentionThreshold || a.understanding < understandingThreshold
  );

  return (
    <div className={`w-full mt-6 ${className}`}>
      <div className="rounded-3xl p-8 bg-[hsl(var(--attune-light-purple))] border border-purple-200 shadow-[0_6px_30px_-8px_rgba(123,104,238,0.07)] mb-1 animate-fade-in">
        <h2 className="text-2xl font-bold text-[hsl(var(--attune-purple))] mb-5 flex items-center gap-2">
          <AlertTriangle className="text-[hsl(var(--attune-purple))]" size={22} />
          Parts to Review
        </h2>
        {toReview.length === 0 ? (
          <div className="flex justify-center items-center min-h-[70px] text-base text-green-700 font-medium">
            No parts need review! 🎉
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {toReview.map((item, idx) => {
              const status = getStatus(item.attention, item.understanding, attentionThreshold, understandingThreshold);
              return (
                <div
                  key={idx}
                  className={`transition hover:scale-[1.016] duration-150 hover:shadow-xl border-2 ${status.color} rounded-2xl p-5 flex flex-col gap-2`}
                >
                  <div className="flex items-center mb-1 gap-2">
                    {status.icon}
                    <span className="font-semibold">{status.label}</span>
                    <span
                      className={`ml-auto text-xs rounded-lg px-2 py-1 font-medium ${status.pill}`}
                    >
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center text-[13px] text-gray-700 mb-0">
                    <span>
                      <span className="font-semibold">Attention:</span>{" "}
                      <span
                        className={
                          item.attention < attentionThreshold
                            ? "font-bold text-yellow-700"
                            : ""
                        }
                      >
                        {item.attention}%
                      </span>
                    </span>
                    <span>
                      <span className="font-semibold">Understanding:</span>{" "}
                      <span
                        className={
                          item.understanding < understandingThreshold
                            ? "font-bold text-blue-700"
                            : ""
                        }
                      >
                        {item.understanding}%
                      </span>
                    </span>
                  </div>
                  <div className="bg-white/60 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 mt-2 shadow-inner">
                    <span className="font-bold text-[hsl(var(--attune-purple))]">What was missed:</span>{" "}
                    {item.transcript}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
