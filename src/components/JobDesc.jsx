import { useState } from "react";
import { FileUpload } from "./ui/UploadFile";
import { Switch } from "@/components/ui/switch"
import SearchBar from "./SearchBar";


export default function JobDesc() {
    
    const [toggleForm, setToggleForm] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [skillSet, setskillSet] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [mode, setMode] = useState("manual"); // or "file"


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload on submit

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        const jobData = {
        jobPosition,
        jobDesc,
        skillSet,
        remarks,
        };

        try {
        const response = await fetch("/api/jobs", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(jobData),
        });

        const data = await response.json();

        if (response.ok) {
            setSuccessMessage(data.message);
            // Optionally, you can reset form state here
            setJobPosition("");
            setJobDesc("");
            setskillSet("");
            setRemarks("");
        } else {
            setErrorMessage("Failed to submit the job data");
        }
        } catch (error) {
        console.error("Error submitting form:", error);
        setErrorMessage("Error submitting the form");
        }

        setIsSubmitting(false);
    };

    function handleToggleForm() {
    setToggleForm(!toggleForm);
    }
// // Function to send email notification, here test only, should be used in other places
//     async function notifyCandidate(email, details) {
//         const response = await fetch('/api/notify-interview', {
//             method: 'POST',
//             headers: {
//             'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, details }),
//         });

//         const data = await response.json();
//         if (response.ok) {
//             alert(data.message);
//         } else {
//             alert('Failed to send notification: ' + data.error);
//         }
//     }

    return (
        <div className="w-full p-4">
            <div className="mt-10 w-1/2 mx-auto">
                <SearchBar />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-10 pt-15">
                <div className="text-center h-100 flex items-center justify-center border">
                    <button onClick={handleToggleForm} className="justify-center button">+</button>
                </div>

                {toggleForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50 transition-opacity">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md text-center">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Job</h2>
                            <div className="mb-4 text-left flex items-center gap-2">
                                <Switch
                                    id="switch"
                                    checked={mode === "file"}
                                    onCheckedChange={mode === "file" ? () => setMode("manual") : () => setMode("file")}
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
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
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
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
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
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                                            placeholder="Enter skill set required"
                                            value={skillSet}
                                            onChange={(e) => setskillSet(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="remarks">
                                            Remarks
                                        </label>
                                        <input
                                            id="remarks"
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                                            placeholder="Enter remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
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
                
                            {mode === "file" && (
                                <div className="text-left">
                                    <label className="block text-gray-700 mb-1 text-sm font-medium">
                                        Upload Job Description File
                                    </label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-md p-4 hover:border-green-600 transition-colors">
                                        <FileUpload />
                                    </div>
                                </div>
                            )}
                
                            <button
                                onClick={() => { handleToggleForm(); setSuccessMessage(""); }}
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
