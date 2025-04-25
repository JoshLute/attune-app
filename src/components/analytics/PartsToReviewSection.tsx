
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
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
  className?: string;
}

// Helper function to identify prolonged confusion periods
const findConfusionPeriods = (analytics: AnalyticsItem[]) => {
  const periods: AnalyticsItem[] = [];
  let currentPeriod: AnalyticsItem[] = [];
  const CONFUSION_THRESHOLD = 60; // Understanding below 60%
  const MIN_DURATION = 2; // Minimum 2 consecutive entries to be considered prolonged

  analytics.forEach((item, index) => {
    if (item.understanding < CONFUSION_THRESHOLD) {
      currentPeriod.push(item);
    } else {
      if (currentPeriod.length >= MIN_DURATION) {
        // Add the middle item of the confusion period to represent the whole period
        const midIndex = Math.floor(currentPeriod.length / 2);
        periods.push(currentPeriod[midIndex]);
      }
      currentPeriod = [];
    }
    
    // Handle the last period
    if (index === analytics.length - 1 && currentPeriod.length >= MIN_DURATION) {
      const midIndex = Math.floor(currentPeriod.length / 2);
      periods.push(currentPeriod[midIndex]);
    }
  });

  return periods;
};

const getStatus = (attention: number, understanding: number) => {
  if (understanding < 60) {
    return {
      label: "Low Understanding",
      color: "bg-gradient-to-br from-[#dde9fc] to-[#f7f9fa] shadow-[4px_4px_18px_0px_rgba(75,123,236,0.11)]",
      pill: "bg-blue-400/80 text-white"
    };
  }
  return {
    label: "Good",
    color: "bg-gradient-to-br from-[#e1fbee] to-[#f7f9fa] shadow-[4px_4px_10px_0px_rgba(71,213,143,0.06)]",
    pill: "bg-green-400/90 text-white"
  };
};

export const PartsToReviewSection: React.FC<PartsToReviewSectionProps> = ({
  analytics,
  className = ""
}) => {
  // Find prolonged confusion periods instead of individual low scores
  const confusionPeriods = findConfusionPeriods(analytics);

  return (
    <div className={`w-full mt-6 animate-fade-in transition-all ${className}`}>
      <Card className="rounded-3xl shadow-[0_8px_38px_-10px_rgba(123,104,238,0.10)]">
        <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3 px-6 rounded-t-3xl">
          <CardTitle className="text-2xl font-bold">Parts to Review</CardTitle>
        </CardHeader>

        <CardContent className="px-3 md:px-6 py-6 bg-white">
          {confusionPeriods.length === 0 ? (
            <div className="flex justify-center items-center min-h-[70px] text-base text-green-700 font-medium">
              No parts need review! 🎉
            </div>
          ) : (
            <Carousel
              opts={{
                axis: "y", 
                slidesToScroll: 1,
                dragFree: false,
                containScroll: "trimSnaps"
              }}
              className="w-full max-w-xl mx-auto relative h-[340px] overflow-hidden"
            >
              <CarouselContent className="-mt-4 flex flex-col">
                {confusionPeriods.map((item, idx) => {
                  const status = getStatus(item.attention, item.understanding);
                  return (
                    <CarouselItem key={idx} className="pt-4 basis-1/3">
                      <div
                        className={`transition duration-150 hover:scale-101 ${status.color} rounded-2xl p-6 flex flex-col gap-2 neumorphic-pressed`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{status.label}</span>
                          <span className={`ml-auto text-xs rounded-lg px-2 py-1 font-medium ${status.pill}`}>
                            {item.timestamp}
                          </span>
                        </div>
                        <div className="flex gap-4 items-center text-[13px] text-gray-700 mb-2">
                          <span>
                            <span className="font-semibold">Understanding:</span>{" "}
                            <span className="font-bold text-blue-700">
                              {item.understanding}%
                            </span>
                          </span>
                        </div>
                        <div className="bg-white/80 shadow-inner rounded-xl p-4 text-[15px] text-gray-800">
                          <span className="font-bold text-[hsl(var(--attune-purple))]">What was missed:</span>{" "}
                          {item.transcript}
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {confusionPeriods.length > 3 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 px-2">
                  <CarouselPrevious className="rotate-90" />
                  <CarouselNext className="rotate-90" />
                </div>
              )}
            </Carousel>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
