"use client";

import { useEffect, useState } from "react";
import JobDesc from "@/components/JobDesc";

export default function Home() {
    const [tableData, setTableData] = useState();

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

            </div>
        </main>
    );
}
