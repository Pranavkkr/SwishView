import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
       <Loader2 className="animate-spin text-crewix-accent mb-4" size={32} />
       <p className="text-gray-500 font-medium animate-pulse">Loading workspace...</p>
    </div>
  );
};
export default Loader;
