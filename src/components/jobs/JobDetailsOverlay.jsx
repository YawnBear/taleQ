import { useEffect, useState } from "react";

export default function JobDetailsOverlay({ jobId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Use your API route instead of direct JamAI call
        const res = await fetch(`/api/jobs?id=${jobId}&action=details`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await res.json();
        
        if (result.success) {
          setDetails(result.details);
          console.log("Job Details:", result.details);
        } else {
          console.error("Failed to fetch job details:", result.error);
          setDetails(null);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchDetails();
    }
  }, [jobId]);

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
            <div className="bg-green-500 text-white p-6">
              <h2 className="text-2xl font-bold">
                {details.jobPosition?.value || "Untitled Position"}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Job Description</h3>
                <div className="text-gray-600 whitespace-pre-wrap">
                  {details.jobDescription?.value || "No description available"}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Required Skills</h3>
                <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                  {details.skillSet?.value?.replace(/^-\s*/gm, '') || "No skills listed"}
                </pre>
              </div>

              {details.remarks?.value && (
                <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Remarks</h3>
                  <p className="text-gray-600">{details.remarks.value}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
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
            <p className="text-lg">Failed to load job details</p>
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