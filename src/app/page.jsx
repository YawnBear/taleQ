"use client";

import { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/uploadFile";

export default function Home() {
    const [tableData, setTableData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/list-tables");
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
            <div>taleQ</div>
            <FileUpload>Upload file</FileUpload>
            <div className="space-y-6">
                <h1 className="text-4xl">List of Tables</h1>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Table ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Columns
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {tableData?.items?.map((table) => (
                            <tr key={table.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{table.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ul className="space-y-2">
                                        {table.cols.map((column) => (
                                            <li key={column.id}>
                                                <span>{column.id}: </span>
                                                <span>{column.dtype}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
