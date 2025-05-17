"use client";

import { useEffect, useState, useRef } from "react";
import JobDesc from "@/components/JobDesc";

export default function Home() {
    const [tableData, setTableData] = useState();
    const fileInputRef = useRef(null);

    const handleUpload = async () => {
        const file = fileInputRef.current?.files[0];

        if (!file) {
            console.error("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://api.jamaibase.com/api/v1/gen_tables/knowledge/upload_file", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: "Bearer jamai_sk_f875897a34ea5a8e6cc158d0f06410fa8f66f8a8ec785cfa",
                    "X-PROJECT-ID": "proj_7e3bdc9b1ddba0ca9ff9cdb7",
                },
                body: formData, // Do NOT set Content-Type manually
            });

            const result = await response.json();
            console.log("Upload result:", result);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/jamai");
                if (response.ok) {
                    const data = await response.json();
                    setTableData(data);
                } else {
                    console.error("Failed to fetch data:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col p-24">
            <div className="flex items-center justify-between">
                <JobDesc />

                <div className="flex flex-col items-start gap-4">
                    <input type="file" id="fileInput" ref={fileInputRef} />
                    <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </main>
    );
}
