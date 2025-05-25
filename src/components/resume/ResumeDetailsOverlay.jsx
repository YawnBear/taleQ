import { useEffect, useState } from "react";

export default function ResumeDetailsOverlay({ resumeId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/view-resume?id=${resumeId}&action=details`);
        const data = await res.json();

        if (data.success) {
          const transformedDetails = Object.entries(data.details).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'object' && value !== null 
              ? value.value || JSON.stringify(value) 
              : value;
            return acc;
          }, {});
          
          setDetails(transformedDetails);
        } else {
          console.error("Failed to fetch resume details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching resume details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchDetails();
    }
  }, [resumeId]);

  const handleViewResume = async () => {
    try {
      const res = await fetch(`/api/view-resume?id=${resumeId}&action=view`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing resume:', error);
    }
  };

  if (!details && !loading) return null;
  
  console.log("Current details state:", details);
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : details ? (
          <>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{details.name}</h2>
              <div className="flex gap-4 text-sm">
                {details['email address'] && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {details['email address']}
                  </div>
                )}
                {details['contact number'] && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {details['contact number']}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {details.education && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
                  <p className="text-gray-600 whitespace-pre-line">{details.education}</p>
                </div>
              )}

              {details['job experience'] && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-600 whitespace-pre-line">{details['job experience']}</p>
                </div>
              )}

              {details.skills && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                  <p className="text-gray-600 whitespace-pre-line">{details.skills}</p>
                </div>
              )}

              {details.projects && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
                  <p className="text-gray-600 whitespace-pre-line">{details.projects}</p>
                </div>
              )}

              {details.achievements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
                  <p className="text-gray-600 whitespace-pre-line">{details.achievements}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
              <button
                onClick={handleViewResume}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Resume
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-md hover:from-emerald-500 hover:to-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Failed to load resume</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}