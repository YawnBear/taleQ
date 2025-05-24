import { useState } from "react";
import { useResumeData, useNotifiedCandidates, useFilteredResumes } from "./resumeHooks";
import ResumeFilters from "./ResumeFilters";
import ResumeTable from "./ResumeTable";
import UploadModal from "./UploadModal";
import ClusteringOverlay from './ClusteringOverlay';

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
        shortlisted: true,
        'ai detection': false
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

    // Add the clustering function
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
                throw new Error("Failed to cluster resumes");
            }
            
            const data = await response.json();
            setClusteredResults(data);
        } catch (error) {
            console.error("Clustering error:", error);
            alert("Failed to cluster resumes. Please try again.");
        } finally {
            setIsClustering(false);
        }
    };

    const handleStatusChange = async (rowId, newStatus) => {
        try {
            const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/update', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                    'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                },
                body: JSON.stringify({
                    data: { shortlisted: newStatus },
                    table_id: process.env.NEXT_PUBLIC_JAMAI_ACTION_TABLE_ID,
                    row_id: rowId
                })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedResumes = resumes.map(resume => 
                resume.ID === rowId 
                    ? { ...resume, shortlisted: newStatus }
                    : resume
            );
            setResumes(updatedResumes);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadedFiles.length) {
            alert("Please upload at least one file.");
            return;
        }

        setIsUploading(true);
        
        try {
            // Process each file sequentially
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
            <div className="w-full max-w-[80rem] mx-auto px-2 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Resumes</h1>
                    <p className="text-gray-600 max-w-3xl">
                        Effective managing all uploaded resumes in one place.
                    </p>
                </div>               
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
                />
            </div>

            <div className="fixed bottom-8 right-8 flex gap-4">
                <button
                    onClick={() => setShowClusteringOverlay(true)}
                    className="w-14 h-14 rounded-full 
                        bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                        shadow-lg hover:shadow-xl 
                        transition-all duration-300 
                        flex items-center justify-center
                        hover:scale-110
                        active:scale-95"
                    title="Cluster Resumes"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                </button>

                <button
                    onClick={() => setShowOverlay(true)}
                    className="w-14 h-14 rounded-full 
                        bg-gradient-to-r from-green-600 to-[#1c843e] text-white 
                        shadow-lg hover:shadow-xl 
                        transition-all duration-300 
                        flex items-center justify-center text-2xl
                        hover:scale-110 hover:rotate-90
                        active:scale-95"
                >
                    +
                </button>
            </div>

            <UploadModal 
                showOverlay={showOverlay}
                setShowOverlay={setShowOverlay}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                handleSubmit={handleSubmit}
                isUploading={isUploading}
            />

            <ClusteringOverlay 
                showOverlay={showClusteringOverlay}
                setShowOverlay={setShowClusteringOverlay}
                clusteringPrompt={clusteringPrompt}
                setClusteringPrompt={setClusteringPrompt}
                handleClustering={handleClustering}
                isClustering={isClustering}
                clusteredResults={clusteredResults}
                handleStatusChange={handleStatusChange}
            />
        </>
    );
}