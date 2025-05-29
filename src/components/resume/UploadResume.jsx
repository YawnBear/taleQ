import { useState } from "react";
import { useResumeData, useNotifiedCandidates, useFilteredResumes } from "./resumeHooks";
import ResumeFilters from "./ResumeFilters";
import ResumeTable from "./ResumeTable";
import UploadModal from "./UploadModal";
import ClusteringPanel from "./ClusteringPanel";
import ClusterResults from "./ClusterResults";

export default function UploadResume() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isUploading, setIsUploading] = useState(false);
    
    // Clustering state
    const [clusteringPrompt, setClusteringPrompt] = useState("");
    const [clusteredResults, setClusteredResults] = useState(null);
    const [isClustering, setIsClustering] = useState(false);
    const [showClusteringOverlay, setShowClusteringOverlay] = useState(false);
    
    // Custom hooks for state management
    const [notifiedCandidates, setNotifiedCandidates] = useNotifiedCandidates();
    
    const [selectedColumns, setSelectedColumns] = useState({
        name: true,
        'contact number': false,
        'email address': false,
        'contact links': false,
        education: true,
        'job experience': true,
        'curriculum activities': false,
        projects: false,
        skills: true,
        achievements: false,
        certifications: false,
        'shortlisted reasons': false,
        shortlisted: true
    });

    const handleColumnChange = (columnName) => {
        if (columnName === 'name' || columnName === 'shortlisted') return;
        setSelectedColumns(prev => ({
            ...prev,
            [columnName]: !prev[columnName]
        }));
    };

    const { resumes, setResumes, loading } = useResumeData(selectedColumns);
    const filteredResumes = useFilteredResumes(resumes, filterStatus, searchQuery, selectedColumns);

    // Clustering function
    const handleClustering = async () => {
        if (!clusteringPrompt.trim()) {
            alert("Please enter a clustering prompt.");
            return;
        }

        setIsClustering(true);
        setClusteredResults(null);
        
        try {
            const response = await fetch("/api/cluster-resumes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: clusteringPrompt,
                    resumes: filteredResumes,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to cluster resumes");
            }
            
            const data = await response.json();
            setClusteredResults(data);
        } catch (error) {
            console.error("Clustering error:", error);
            alert(`Failed to cluster resumes: ${error.message}`);
        } finally {
            setIsClustering(false);
        }
    };

    // Status change handler
    const handleStatusChange = async (rowId, newStatus) => {
        try {
            const response = await fetch('/api/update-resume-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rowId,
                    newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            // Update local state
            const updatedResumes = resumes.map(resume => 
                resume.ID === rowId 
                    ? { ...resume, shortlisted: newStatus }
                    : resume
            );
            setResumes(updatedResumes);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.message}`);
        }
    };

    // Delete resume handler
    const handleDeleteResumes = (deletedIds) => {
        const updatedResumes = resumes.filter(resume => !deletedIds.includes(resume.ID));
        setResumes(updatedResumes);
    };

    // Upload handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadedFiles.length) {
            alert("Please upload at least one file.");
            return;
        }

        setIsUploading(true);
        
        try {
            for (const file of uploadedFiles) {
                const formData = new FormData();
                formData.append("file", file);
                
                const response = await fetch("/api/upload-resume", {
                    method: "POST",
                    body: formData,
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }
            }
            
            alert(`Successfully uploaded ${uploadedFiles.length} resume${uploadedFiles.length > 1 ? 's' : ''}`);
            setShowOverlay(false);
            setUploadedFiles([]);
            // Refresh the resume list
            const fetchResumesEvent = new Event('fetchResumes');
            window.dispatchEvent(fetchResumesEvent);
        } catch (error) {
            console.error("Error uploading:", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;

    return (
        <>
            <div className="w-full max-w-[100rem] mx-auto px-6 py-8">
                <ResumeFilters 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    selectedColumns={selectedColumns}
                    handleColumnChange={handleColumnChange}
                />

                <ResumeTable 
                    filteredResumes={filteredResumes}
                    selectedColumns={selectedColumns}
                    handleStatusChange={handleStatusChange}
                    notifiedCandidates={notifiedCandidates}
                    setNotifiedCandidates={setNotifiedCandidates}
                    onDeleteResume={handleDeleteResumes}
                    handleColumnChange={handleColumnChange}
                />
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-4">
                {/* Clustering Button */}
                <button
                    onClick={() => setShowClusteringOverlay(true)}
                    className="w-14 h-14 rounded-full 
                        bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                        shadow-lg hover:shadow-xl 
                        transition-all duration-300 
                        flex items-center justify-center
                        hover:scale-110
                        active:scale-95"
                    title="AI Clustering"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m2-6l2 2m0 0l2 2m-2-2v6" />
                    </svg>
                </button>

                {/* Upload Button */}
                <button
                    onClick={() => setShowOverlay(true)}
                    className="w-14 h-14 rounded-full 
                        bg-gradient-to-r from-green-600 to-[#1c843e] text-white 
                        shadow-lg hover:shadow-xl 
                        transition-all duration-300 
                        flex items-center justify-center text-2xl
                        hover:scale-110 hover:rotate-90
                        active:scale-95"
                    title="Upload Resume"
                >
                    +
                </button>
            </div>

            {/* Upload Modal */}
            <UploadModal 
                showOverlay={showOverlay}
                setShowOverlay={setShowOverlay}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                handleSubmit={handleSubmit}
                isUploading={isUploading}
            />

            {/* Clustering Overlay */}
            {showClusteringOverlay && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">AI Resume Clustering</h2>
                                    <p className="text-blue-100 mt-1">
                                        Group and analyze {filteredResumes.length} resumes intelligently
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowClusteringOverlay(false)}
                                    className="text-white/80 hover:text-white transition-colors p-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
                            {/* Clustering Panel */}
                            <div className="mb-8">
                                <ClusteringPanel 
                                    clusteringPrompt={clusteringPrompt}
                                    setClusteringPrompt={setClusteringPrompt}
                                    handleClustering={handleClustering}
                                    isClustering={isClustering}
                                />
                            </div>
                            
                            {/* Results */}
                            {clusteredResults && (
                                <div>
                                    <ClusterResults 
                                        clusteredResults={clusteredResults}
                                        handleStatusChange={handleStatusChange}
                                    />
                                </div>
                            )}

                            {/* Empty State */}
                            {!clusteredResults && !isClustering && (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m2-6l2 2m0 0l2 2m-2-2v6" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Cluster</h3>
                                    <p className="text-gray-500">
                                        Enter your clustering criteria above and click "Cluster Resumes" to get started.
                                    </p>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-3">Example Prompts:</h4>
                                            <ul className="text-sm text-blue-700 space-y-2">
                                                <li>• "Group by years of experience"</li>
                                                <li>• "Find candidates with Python skills"</li>
                                                <li>• "Cluster by education level"</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 p-6 rounded-lg">
                                            <h4 className="font-medium text-purple-900 mb-3">AI Features:</h4>
                                            <ul className="text-sm text-purple-700 space-y-2">
                                                <li>• Smart grouping analysis</li>
                                                <li>• Natural language prompts</li>
                                                <li>• Instant results</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {clusteredResults ? (
                                    <span className="flex items-center text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Clustering completed successfully
                                    </span>
                                ) : (
                                    `Ready to cluster ${filteredResumes.length} resumes`
                                )}
                            </div>
                            <button
                                onClick={() => setShowClusteringOverlay(false)}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}