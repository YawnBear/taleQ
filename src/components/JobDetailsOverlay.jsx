import { useEffect, useState } from "react";

export default function JobDetailsOverlay({ jobId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `https://api.jamaibase.com/api/v1/gen_tables/knowledge/jobs/rows/${jobId}?columns=jobPosition&columns=jobDescription&columns=skillSet&columns=remarks`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
              "X-PROJECT-ID": process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID,
            },
          }
        );
        const data = await res.json();
        setDetails(data);
        console.log("Job Details:", data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [jobId]);

  if (!details && !loading) return null;
  console.log("Current details state:", details);
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {details.jobPosition?.value || "Untitled Position"}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {details.jobDescription?.value || "No description available"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Required Skills</h3>
                <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                  {details.skillSet?.value?.replace(/^-\s*/gm, '') || "No skills listed"}
                </pre>
              </div>

              {details.remarks?.value && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Remarks</h3>
                  <p className="text-gray-600">{details.remarks.value}</p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}