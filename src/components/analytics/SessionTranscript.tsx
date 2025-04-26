
import React from 'react';

interface AnalyticsData {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

interface SessionTranscriptProps {
  analyticsData: AnalyticsData[];
}

export const SessionTranscript: React.FC<SessionTranscriptProps> = ({ analyticsData }) => {
  // If no analyticsData is provided or it's empty, return null
  if (!analyticsData || analyticsData.length === 0) {
    return null;
  }

  // Create a single transcript with the new content, using the first item's timestamp
  const dummyTranscript: AnalyticsData = {
    timestamp: analyticsData[0].timestamp,
    attention: 85,
    understanding: 90,
    transcript: `Good morning, everyone! Today, we're going to learn about how fractions and decimals are related.
Let's start by remembering what a fraction is. A fraction represents a part of a whole, like 1/2 or 3/4.
Now, decimals are another way to show parts of a whole, just written differently. For example, 1/2 is the same as 0.5.

Let's look at how to convert a fraction to a decimal. To do that, you just divide the top number (the numerator) by the bottom number (the denominator). So, if I have 3/4, I divide 3 by 4, which equals 0.75.
Let's try another one: What about 1/5? If I divide 1 by 5, I get 0.2.

Now, let's do it the other way—turning a decimal into a fraction. For example, if I have 0.4, I think "what place value is the 4 in?" It's in the tenths place, so 0.4 is the same as 4/10. But we always want to simplify our fractions, so 4/10 becomes 2/5.

Fractions and decimals are both useful, and sometimes one is easier to work with than the other, depending on the problem.
Let's practice together! On your worksheet, you'll see a list of fractions and decimals. Try matching each fraction with its equivalent decimal.

When you're done, we'll review the answers as a class and discuss any questions you might have.
Remember: to go from a fraction to a decimal, divide the numerator by the denominator. To go from a decimal to a fraction, use the place value and simplify.

Take your time and let me know if you need help!`
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
      <div className="max-h-80 overflow-y-auto rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
        {analyticsData.length > 0 ? (
          <div className="mb-3">
            <span className="text-[15px] text-gray-800">{dummyTranscript.transcript}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
