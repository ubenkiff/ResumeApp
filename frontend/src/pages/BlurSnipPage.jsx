import React from 'react';
import BlurSnipModule from '../components/BlurSnip/BlurSnipModule';

function BlurSnipPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Blur & Snip</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload a resume (PDF/image), blur sensitive info, and create shareable snips.
          </p>
        </div>
        <BlurSnipModule />
      </div>
    </div>
  );
}

export default BlurSnipPage;
