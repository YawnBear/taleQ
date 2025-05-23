import React from 'react';
import { FileUpload } from "@/components/ui/UploadFile";

export default function UploadModal({
    showOverlay,
    setShowOverlay,
    uploadedFiles,
    setUploadedFiles,
    handleSubmit,
    isUploading
}) {
    if (!showOverlay) return null;
    
    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowOverlay(false)}
        >
            <div
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Upload Resume
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-4 hover:border-green-600 transition-colors">
                        <FileUpload onChange={(files) => setUploadedFiles(files)} multiple={true} />
                        
                        {/* Display list of selected files */}
                        {uploadedFiles.length > 0 && (
                            <FileList files={uploadedFiles} onRemoveFile={(index) => {
                                setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            }} />
                        )}
                    </div>

                    <div className="flex gap-4 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => setShowOverlay(false)}
                            className="px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <SubmitButton isUploading={isUploading} />
                    </div>
                </form>
            </div>
        </div>
    );
}

function FileList({ files, onRemoveFile }) {
    return (
        <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">
                Selected Files ({files.length}):
            </p>
            <ul className="max-h-32 overflow-y-auto text-sm">
                {files.map((file, index) => (
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
                            onClick={() => onRemoveFile(index)}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SubmitButton({ isUploading }) {
    return (
        <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-[#1c843e] text-white rounded-md 
                hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 
                font-medium shadow-md hover:shadow-lg disabled:opacity-50 
                disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isUploading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Uploading...
                </>
            ) : (
                'Upload'
            )}
        </button>
    );
}