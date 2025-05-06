
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      color: "bg-gradient-to-br from-[#ffe2e2] to-[#f7f9fa] dark:from-[#4a2626] dark:to-[#2c2c2e] shadow-[4px_4px_18px_0px_rgba(234,56,76,0.07)] dark:shadow-[4px_4px_18px_0px_rgba(234,56,76,0.15)]",
      pill: "bg-red-400/80 text-white dark:bg-red-600/80"
    };
  if (attention < attentionThreshold)
    return {
      label: "Low Attention",
      color: "bg-gradient-to-br from-[#fef6e4] to-[#f7f9fa] dark:from-[#433b27] dark:to-[#2c2c2e] shadow-[4px_4px_14px_0px_rgba(253,202,87,0.08)] dark:shadow-[4px_4px_14px_0px_rgba(253,202,87,0.15)]",
      pill: "bg-yellow-400/90 text-gray-900 dark:bg-yellow-600/90 dark:text-white"
    };
  if (understanding < understandingThreshold)
    return {
      label: "Low Understanding",
      color: "bg-gradient-to-br from-[#dde9fc] to-[#f7f9fa] dark:from-[#1e2c41] dark:to-[#2c2c2e] shadow-[4px_4px_18px_0px_rgba(75,123,236,0.11)] dark:shadow-[4px_4px_18px_0px_rgba(75,123,236,0.2)]",
      pill: "bg-blue-400/80 text-white dark:bg-blue-600/80"
    };
  return {
    label: "Good",
    color: "bg-gradient-to-br from-[#e1fbee] to-[#f7f9fa] dark:from-[#1d3928] dark:to-[#2c2c2e] shadow-[4px_4px_10px_0px_rgba(71,213,143,0.06)] dark:shadow-[4px_4px_10px_0px_rgba(71,213,143,0.15)]",
    pill: "bg-green-400/90 text-white dark:bg-green-600/90"
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
    <div className={`w-full mt-6 animate-fade-in transition-all ${className}`}>
      <Card className="rounded-3xl shadow-[0_8px_38px_-10px_rgba(123,104,238,0.10)] dark:shadow-[0_8px_38px_-10px_rgba(123,104,238,0.20)]">
        <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3 px-6 rounded-t-3xl">
          <CardTitle className="text-2xl font-bold">Parts to Review</CardTitle>
        </CardHeader>

        <CardContent className="px-3 md:px-6 py-6 bg-white dark:bg-gray-800">
          {toReview.length === 0 ? (
            <div className="flex justify-center items-center min-h-[70px] text-base text-green-700 dark:text-green-400 font-medium">
              No parts need review! 🎉
            </div>
          ) : (
            <Carousel
              orientation="vertical"
              className="w-full max-w-xl mx-auto relative"
              opts={{ dragFree: true, align: "start" }}
            >
              <CarouselContent className="flex flex-col gap-7">
                {toReview.map((item, idx) => {
                  const status = getStatus(
                    item.attention,
                    item.understanding,
                    attentionThreshold,
                    understandingThreshold
                  );
                  return (
                    <CarouselItem key={idx} className="w-full">
                      <div
                        className={`transition duration-150 hover:scale-101 ${status.color} rounded-2xl p-6 flex flex-col gap-2 neumorphic-pressed`}
                        style={{
                          boxShadow:
                            "0 2px 12px 0 rgba(123,104,238,0.03), 4px 4px 24px 0 rgba(123,104,238,0.06)",
                          border: "none",
                          background: "inherit"
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{status.label}</span>
                          <span
                            className={`ml-auto text-xs rounded-lg px-2 py-1 font-medium ${status.pill}`}
                          >
                            {item.timestamp}
                          </span>
                        </div>
                        <div className="flex gap-4 items-center text-[13px] text-gray-700 dark:text-gray-300 mb-2">
                          <span>
                            <span className="font-semibold">Attention:</span>{" "}
                            <span
                              className={
                                item.attention < attentionThreshold
                                  ? "font-bold text-yellow-700 dark:text-yellow-400"
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
                                  ? "font-bold text-blue-700 dark:text-blue-400"
                                  : ""
                              }
                            >
                              {item.understanding}%
                            </span>
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-900/80 shadow-inner rounded-xl p-4 text-[15px] text-gray-800 dark:text-gray-200">
                          <span className="font-bold text-[hsl(var(--attune-purple))]">What was missed:</span>{" "}
                          {item.transcript}
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {toReview.length > 1 && (
                <div className="flex flex-row justify-between mt-4 px-6">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              )}
            </Carousel>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
