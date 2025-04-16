
import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AttuneSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to Attune</h1>
        <p>Select a student from the sidebar to view their details.</p>
      </div>
    </div>
  );
};

export default Index;
