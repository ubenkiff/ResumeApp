import React from 'react';

function CoverLetterTemplate({
  profile = {},
  jobTitle = '',
  companyName = '',
  coverLetterContent = '',
  references = [],
  onEdit,
  onSave,
  onDownload
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, Calibri, sans-serif' }}>

      {/* Header - matches resume format */}
      <div className="border-b-2 border-blue-500 pb-4 mb-6">
        <div className="flex gap-6">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{profile.name || 'Your Name'}</h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mt-1">
              {profile.title || 'Professional Title'}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600 mt-2">
              {profile.email && <span>📧 {profile.email}</span>}
              {profile.phone && <span>📞 {profile.phone}</span>}
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Date and Recipient */}
      <div className="mb-6">
        <p className="text-gray-700">{currentDate}</p>
        <p className="text-gray-700 mt-3">Hiring Manager</p>
        {companyName && <p className="text-gray-700">{companyName}</p>}
      </div>

      {/* Salutation */}
      <p className="text-gray-800 mb-4">Dear Hiring Manager,</p>

      {/* Cover Letter Content */}
      <div className="space-y-4">
        {coverLetterContent ? (
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {coverLetterContent}
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-8">
            Generate a cover letter to see it here
          </div>
        )}

        {/* References Section - Only shown if user has selected references to include */}
        {references && references.filter(r => r.include_in_letter).length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Professional References</h3>
            <div className="space-y-3">
              {references.filter(r => r.include_in_letter).map((ref, idx) => (
                <div key={idx} className="text-sm">
                  <p className="font-semibold text-gray-800">{ref.name}</p>
                  <p className="text-gray-600">{ref.title} at {ref.company}</p>
                  <p className="text-gray-500 text-xs">{ref.relationship}</p>
                  {ref.email && <p className="text-gray-500 text-xs">{ref.email}</p>}
                  {ref.phone && <p className="text-gray-500 text-xs">{ref.phone}</p>}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">References available upon request</p>
          </div>
        )}
      </div>

      {/* Closing */}
      {coverLetterContent && (
        <>
          <p className="text-gray-800 mt-6">Sincerely,</p>
          <p className="text-gray-800 mt-2 font-semibold">{profile.name || 'Your Name'}</p>
          <p className="text-gray-500 text-sm mt-4">
            PFA my resume. View my portfolio:{' '}
            <a href={profile.portfolioUrl || '#'} className="text-blue-600 hover:underline">
              ResumeApp Portfolio
            </a>
          </p>
        </>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-4 border-t border-gray-200 flex gap-3 no-print">
        {coverLetterContent && (
          <>
            <button
              onClick={() => onEdit && onEdit()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
            >
              <i className="fas fa-edit mr-2"></i> Edit
            </button>
            <button
              onClick={() => onSave && onSave()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
            >
              <i className="fas fa-save mr-2"></i> Save
            </button>
            <button
              onClick={() => onDownload && onDownload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
            >
              <i className="fas fa-download mr-2"></i> Download PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CoverLetterTemplate;
