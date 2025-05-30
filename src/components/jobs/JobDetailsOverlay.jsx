import { useEffect, useState } from "react";

export default function JobDetailsOverlay({ jobId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
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

  const handleEdit = () => {
    setEditedDetails({
      jobPosition: details.jobPosition?.value || "",
      jobDescription: details.jobDescription?.value || "",
      skillSet: details.skillSet?.value || "",
      remarks: details.remarks?.value || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/edit-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobId,
          jobPosition: editedDetails.jobPosition,
          jobDescription: editedDetails.jobDescription,
          skillSet: editedDetails.skillSet,
          remarks: editedDetails.remarks
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update job details');
      }

      // Update local state with new values
      setDetails({ 
        ...details,
        jobPosition: { value: editedDetails.jobPosition },
        jobDescription: { value: editedDetails.jobDescription },
        skillSet: { value: editedDetails.skillSet },
        remarks: { value: editedDetails.remarks }
      });
      setIsEditing(false);

    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails(null);
  };

  if (!details && !loading) return null;

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
              {isEditing ? (
                <input
                  type="text"
                  value={editedDetails.jobPosition}
                  onChange={(e) => setEditedDetails(prev => ({
                    ...prev,
                    jobPosition: e.target.value
                  }))}
                  className="w-full px-3 py-2 text-2xl font-bold bg-white/10 rounded border border-white/20 text-white placeholder-white/60"
                  placeholder="Enter job position"
                />
              ) : (
                <h2 className="text-2xl font-bold">
                  {details.jobPosition?.value || "Untitled Position"}
                </h2>
              )}
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Job Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedDetails.jobDescription}
                    onChange={(e) => setEditedDetails(prev => ({
                      ...prev,
                      jobDescription: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                    rows="4"
                    placeholder="Enter job description"
                  />
                ) : (
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {details.jobDescription?.value || "No description available"}
                  </div>
                )}
              </div>

              <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Required Skills</h3>
                {isEditing ? (
                  <textarea
                    value={editedDetails.skillSet}
                    onChange={(e) => setEditedDetails(prev => ({
                      ...prev,
                      skillSet: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                    rows="4"
                    placeholder="Enter required skills"
                  />
                ) : (
                  <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                    {details.skillSet?.value?.replace(/^-\s*/gm, '') || "No skills listed"}
                  </pre>
                )}
              </div>

              <div className="bg-white shadow rounded-lg p-5 border-l-4 border-l-green-500">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Remarks</h3>
                {isEditing ? (
                  <textarea
                    value={editedDetails.remarks}
                    onChange={(e) => setEditedDetails(prev => ({
                      ...prev,
                      remarks: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                    rows="2"
                    placeholder="Enter remarks"
                  />
                ) : (
                  <p className="text-gray-600">{details.remarks?.value || "No remarks"}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-md 
                             hover:from-emerald-500 hover:to-green-600 transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-md hover:from-emerald-500 hover:to-green-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
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