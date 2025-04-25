import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';

const Index = () => {
  const userName = "Dr. Lute"; // This matches the name in ProfileSection

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Welcome back, {userName}</h1>
          <p className="text-gray-600">
            Here's a summary of your recent activity and some quick actions to get you started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
