import { useEffect, useState } from "react";
import {FileUpload} from "@/components/ui/uploadFile"

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
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
        Name
        </label>
        <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded-md dark:bg-neutral-900 dark:text-white"
        />
    </div>

    <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
        Description
        </label>
        <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 border rounded-md dark:bg-neutral-900 dark:text-white"
        />
    </div>

    <div>
        <FileUpload onChange={(files) => setUploadedFiles(files)} />
    </div>

    <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
    >
        Submit
    </button>
    </form>
);
}