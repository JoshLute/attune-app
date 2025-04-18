
const UnderstandingSummary = () => {
  // Calculate understanding percentage from mock data
  const totalSegments = lessonOutline.length;
  const attentiveSegments = lessonOutline.filter(segment => segment.status === 'attentive').length;
  const confusedSegments = lessonOutline.filter(segment => segment.status === 'confused').length;
  
  const understandingPercentage = Math.round((attentiveSegments / totalSegments) * 100);
  const confusionPercentage = Math.round((confusedSegments / totalSegments) * 100);
  
  return (
    <Card className="rounded-2xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] border border-purple-100">
      <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
        <CardTitle className="text-xl">Summary</CardTitle>
        <CardDescription className="text-white text-opacity-80">4 Minutes 22 Seconds</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-600">Understanding</span>
          <span className="text-2xl font-bold text-[hsl(var(--attune-purple))]">{understandingPercentage}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-green-500" 
            style={{ width: `${understandingPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-600">Confusion</span>
          <span className="text-2xl font-bold text-red-500">{confusionPercentage}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-red-500" 
            style={{ width: `${confusionPercentage}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};
