import { useState } from "react";
import { FileUpload } from "@/components/ui/UploadFile";
import { Switch } from "@/components/ui/switch";
import SearchBar from "./SearchBar";
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

    const handleToggleForm = () => {
        setToggleForm(!toggleForm);
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleSubmit = async (e) => {

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
        if (mode === "manual") {
            const jobData = {
                jobPosition,
                jobDesc,
                skillSet,
                remarks,
            };

            const generateResponse = await fetch("/api/generate-pdf", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(jobData),
            });

            const generateData = await generateResponse.json();
            if (!generateResponse.ok) throw new Error(generateData.message || "Failed to generate PDF");

            // Convert base64 to a Blob
            const pdfBlob = new Blob([Uint8Array.from(atob(generateData.base64), c => c.charCodeAt(0))], {
                type: "application/pdf",
            });

            const formData = new FormData();
            formData.append("file", pdfBlob, jobPosition + ".pdf");
            formData.append("jobPosition", jobPosition);

            const uploadResponse = await fetch("/api/upload-jobs", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.message || "Failed to upload to Jamaibase");
        } else if (mode === "file") {
            if (!uploadedFiles.length) throw new Error("Please upload a PDF file.");

            const formData = new FormData();
            formData.append("file", uploadedFiles[0]);
            formData.append("jobPosition", jobPosition);

            const uploadResponse = await fetch("/api/upload-jobs", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.message || "File upload failed");
        }

        setSuccessMessage("Job submitted and uploaded successfully!");
        setJobPosition("");
        setJobDesc("");
        setskillSet("");
        setRemarks("");
        setUploadedFiles([]);
    } catch (error) {
        console.error("Submission error:", error);
        setErrorMessage(error.message || "Something went wrong");
    } finally {
        setIsSubmitting(false);
    }
};


    return (
        <div className="w-full p-4">
            <div className="mt-10 w-1/2 mx-auto">
                <SearchBar value={searchQuery} onChange={setSearchQuery}/>
            </div>
            <div className="px-10 pt-15">
                <JobPosting handleToggleForm={handleToggleForm} searchQuery={searchQuery}/>
                

                {toggleForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50 transition-opacity">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md text-center">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Job</h2>
                            <div className="mb-4 text-left flex items-center gap-2">
                                <Switch
                                    id="switch"
                                    checked={mode === "file"}
                                    onCheckedChange={() => setMode(mode === "file" ? "manual" : "file")}
                                />
                                <label htmlFor="switch" className="text-gray-700">File Upload</label>
                            </div>

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
                                    {successMessage && <div className="mt-4 text-green-600">{successMessage}</div>}
                                    {errorMessage && <div className="mt-4 text-red-500">{errorMessage}</div>}
                                </form>
                            )}

                            {mode === "file" && (
                                <form onSubmit={handleSubmit}>

                                    <div className="text-left mb-4">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">
                                            Upload Job Description File (PDF)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-md p-4 hover:border-green-600 transition-colors">
                                            <FileUpload onChange={(files) => setUploadedFiles(files)} />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-[#1c843e] text-white px-6 py-2.5 rounded-md hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit"}
                                    </button>
                                    {successMessage && <div className="mt-4 text-green-600">{successMessage}</div>}
                                    {errorMessage && <div className="mt-4 text-red-500">{errorMessage}</div>}
                                </form>
                            )}


                            <button
                                onClick={handleToggleForm}
                                className="mt-6 px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
