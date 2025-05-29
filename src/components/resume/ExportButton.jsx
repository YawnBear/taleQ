import React, { useState } from 'react';

export default function ExportButton({ selectedColumns }) {
    const [isExporting, setIsExporting] = useState(false);

    const downloadCsv = (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumes_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleExportToCSV = async () => {
        setIsExporting(true);
        try {
            const columns = Object.entries(selectedColumns)
                .filter(([_, isSelected]) => isSelected)
                .map(([column]) => column)
                .join(',');

            const response = await fetch(`/api/export-resume?columns=${columns}`);


            if (!response.ok) {
                throw new Error('Failed to export CSV');
            }

            const blob = await response.blob();
            downloadCsv(blob);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data: ' + error.message);
        } finally {
            setIsExporting(false);
        }
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
            {isExporting ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Exporting...
                </>
            ) : (
                <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export to CSV
                </>
            )}
        </button>
    );
}
