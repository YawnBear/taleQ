import { useEffect, useState } from "react";
import {FileUpload} from "@/components/ui/UploadFile"

export default function UploadResume() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!uploadedFiles.length) {
            alert("Please upload a file.");
        return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("file", uploadedFiles[0]); // only one file for now

        try {
            const response = await fetch("/api/uploadResume", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Upload failed");
        }
    };

return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mt-10 space-y-6">
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                />
            </div>

            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                />
            </div>

            <div className="border border-dashed border-gray-300 rounded-md p-4 hover:border-green-600 transition-colors">
                <FileUpload onChange={(files) => setUploadedFiles(files)} />
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-[#1c843e] text-white px-6 py-2.5 rounded-md hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
                Submit
            </button>
        </form>
    );
}