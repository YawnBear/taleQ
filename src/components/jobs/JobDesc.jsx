import { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/UploadFile";
import { Switch } from "@/components/ui/switch";
import SearchBar from "../ui/SearchBar";
import JobPosting from "./JobPosting";

export default function JobDesc() {
    const [toggleForm, setToggleForm] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [skillSet, setSkillSet] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [mode, setMode] = useState("manual");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const handleToggleForm = () => {
        setToggleForm(!toggleForm);
        setSuccessMessage("");
        setErrorMessage("");
    };
    
    const handleSubmit = async (e) => {
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        e.preventDefault();

        try {
            if (mode === "manual") {
                const jobData = {
                    jobPosition,
                    jobDesc,
                    skillSet,
                    remarks,
                };

                // First generate the PDF
                const generateResponse = await fetch("/api/generate-pdf", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(jobData),
                });

                if (!generateResponse.ok) {
                    const error = await generateResponse.json();
                    throw new Error(error.message || "Failed to generate PDF");
                }

                const generateData = await generateResponse.json();

                // Create PDF blob from base64
                const binaryStr = atob(generateData.base64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const pdfBlob = new Blob([bytes], { type: "application/pdf" });

                // Create FormData and append file
                const formData = new FormData();
                formData.append("file", pdfBlob, `${jobPosition}.pdf`);
                formData.append("jobPosition", jobPosition);

                // Upload to server using consolidated endpoint
                const uploadResponse = await fetch("/api/jobs", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.message || "Failed to upload to Jamaibase");
                }

                setSuccessMessage("Job submitted and uploaded successfully!");
                // Reset form
                setJobPosition("");
                setJobDesc("");
                setSkillSet("");
                setRemarks("");
                
            } else if (mode === "file") {
                if (!uploadedFiles.length) {
                    throw new Error("Please upload at least one PDF file.");
                }

                // Track successful uploads
                let successCount = 0;
                const totalFiles = uploadedFiles.length;
                
                // Process each file
                for (const file of uploadedFiles) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("jobPosition", jobPosition || file.name.replace('.pdf', ''));

                    // Use consolidated endpoint
                    const uploadResponse = await fetch("/api/jobs", {
                        method: "POST",
                        body: formData,
                    });

                    if (uploadResponse.ok) {
                        successCount++;
                    } else {
                        const error = await uploadResponse.json();
                        console.error(`Failed to upload ${file.name}:`, error);
                    }
                }

                // Report results
                if (successCount === totalFiles) {
                    setSuccessMessage(`Successfully uploaded ${successCount} file(s)!`);
                } else if (successCount > 0) {
                    setSuccessMessage(`Uploaded ${successCount} out of ${totalFiles} files.`);
                } else {
                    throw new Error("Failed to upload files. Please try again.");
                }
                
                setUploadedFiles([]);
                setJobPosition("");
            }
        } catch (error) {
            console.error("Submission error:", error);
            setErrorMessage(error.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Job Listings</h1>
                    <p className="text-gray-600 max-w-3xl">
                        Browse available positions or create new job descriptions.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="mb-8 max-w-xl mx-auto">
                    <SearchBar 
                        value={searchQuery} 
                        onChange={setSearchQuery} 
                        placeholder="Search job positions..."
                        className="shadow-md transition-all focus-within:shadow-lg"
                    />
                </div>
                
                {/* Job Listings */}
                <div className="px-4">
                    <JobPosting handleToggleForm={handleToggleForm} searchQuery={searchQuery}/>
                </div>
                
                {/* Modal stays mostly the same */}
                {toggleForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-opacity">
                        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {mode === "file" ? "Upload Job Description" : "Create New Job"}
                                </h2>
                                <button
                                    onClick={handleToggleForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Mode Toggle */}
                            <div className="mb-6 flex items-center gap-4">
                                <label
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${mode === "manual" 
                                        ? 'border-green-500 bg-green-50 text-green-700' 
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'} 
                                        cursor-pointer transition-colors text-center`}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={mode === "manual"}
                                        onChange={() => setMode("manual")}
                                    />
                                    <span className="font-medium">Manual Entry</span>
                                </label>
                                
                                <label
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${mode === "file" 
                                        ? 'border-green-500 bg-green-50 text-green-700' 
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'} 
                                        cursor-pointer transition-colors text-center`}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={mode === "file"}
                                        onChange={() => setMode("file")}
                                    />
                                    <span className="font-medium">File Upload</span>
                                </label>
                            </div>

                            {/* Forms remain mostly the same but with some styling updates */}
                            {mode === "manual" && (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="text-left">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="jobPosition">
                                            Job Position
                                        </label>
                                        <input
                                            id="jobPosition"
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md"
                                            placeholder="Enter job position"
                                            value={jobPosition}
                                            onChange={(e) => setJobPosition(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="jobDesc">
                                            Job Description
                                        </label>
                                        <textarea
                                            id="jobDesc"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md"
                                            placeholder="Enter job description"
                                            rows={4}
                                            value={jobDesc}
                                            onChange={(e) => setJobDesc(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="skillSet">
                                            Skill Set Required
                                        </label>
                                        <input
                                            id="skillSet"
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md"
                                            placeholder="Enter skill set required"
                                            value={skillSet}
                                            onChange={(e) => setSkillSet(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="remarks">
                                            Remarks
                                        </label>
                                        <input
                                            id="remarks"
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md"
                                            placeholder="Enter remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-[#1c843e] text-white px-6 py-2.5 rounded-md hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 font-medium shadow-md"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit"}
                                    </button>
                                </form>
                            )}

                            {mode === "file" && (
                                <form onSubmit={handleSubmit}>
                                    <div className="text-left mb-4">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">
                                            Upload Job Description File
                                        </label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-green-600 transition-colors bg-gray-50">
                                            <div className="text-center mb-4">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-1 text-sm text-gray-500">
                                                  Drag and drop files, or <span className="text-green-600 font-medium">browse</span>
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">Documents only</p>
                                              </div>
                                              
                                            <FileUpload onChange={(files) => setUploadedFiles(files)} multiple={true} />
                                            
                                            {/* Display list of selected files */}
                                            {uploadedFiles.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Selected Files ({uploadedFiles.length}):
                                                    </p>
                                                    <ul className="max-h-32 overflow-y-auto text-sm mt-2">
                                                        {uploadedFiles.map((file, index) => (
                                                            <li key={index} className="flex items-center justify-between py-1">
                                                                <div className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="truncate" style={{maxWidth: '200px'}}>{file.name}</span>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    className="text-red-500 hover:text-red-700"
                                                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-[#1c843e] text-white px-6 py-2.5 rounded-md hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit"}
                                    </button>
                                </form>
                            )}

                            {/* Success and Error Messages */}
                            {successMessage && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                                    {successMessage}
                                </div>
                            )}
                            {errorMessage && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
