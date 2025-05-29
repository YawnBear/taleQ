import React, { useState } from 'react';

export default function ExportButton({ selectedColumns }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportToCSV = async () => {
        setIsExporting(true);
        try {
            const columns = Object.entries(selectedColumns)
                .filter(([_, isSelected]) => isSelected)
                .map(([column]) => column)
                .join('&columns=');

            console.log('Selected columns:', columns);

            const response = await fetch(`https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.NEXT_PUBLIC_JAMAI_ACTION_TABLE_ID}/export_data?delimiter=%2C&columns=${columns}`,
                {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                    'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to export data');
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const jsonData = await response.json();
                const csvContent = convertJsonToCsv(jsonData);
                downloadCsv(csvContent);
            } else {
                const blob = await response.blob();
                downloadCsv(blob);
            }

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const downloadCsv = (content) => {
        const blob = content instanceof Blob
            ? content
            : new Blob([content], { type: 'text/csv;charset=utf-8;' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumes_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <button
            onClick={handleExportToCSV}
            disabled={isExporting}
            className={`px-4 py-2 text-white text-sm rounded-md
                transition-colors flex items-center gap-2
                ${isExporting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
            </svg>
            {isExporting ? 'Exporting...' : 'Export to CSV'}
        </button>
    );
}
