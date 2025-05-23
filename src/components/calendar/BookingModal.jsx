import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch'; // Make sure this import path is correct

export default function BookingModal({ isOpen, onClose, selectedDate, selectedSlot, onBookSlot }) {
    // Store the date internally to prevent it from being lost
    const [dateValue, setDateValue] = useState(null);
    // New state for the display toggle
    const [showSelectedDateOnly, setShowSelectedDateOnly] = useState(true);
    
    // Update internal date when props change
    useEffect(() => {
        if (selectedDate) {
            setDateValue(selectedDate);
        }
    }, [selectedDate]);
    
    // If the modal isn't open or there's no date, don't render
    if (!isOpen || !dateValue) return null;

    // Format the date safely
    const formattedDate = dateValue ? format(new Date(dateValue), 'EEEE, MMMM d, yyyy') : '';

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Use the stored dateValue instead of relying on the prop
        onBookSlot({
            candidateName: formData.get('candidateName'),
            email: formData.get('email'),
            date: dateValue, // Pass the stored date back
            showSelectedDateOnly, // Pass the display preference
        });
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
                className="bg-white p-6 rounded-lg w-96 shadow-xl border border-gray-200"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
            >
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Book Interview Slot
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="bg-emerald-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-emerald-800">
                                Interview Details
                            </p>
                            <p className="text-sm text-emerald-600 mt-1">
                                {formattedDate} at {selectedSlot}
                            </p>
                        </div>
                        
                        {/* Display toggle switch */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
                                Show only slots for this date
                            </label>
                            <Switch 
                                id="date-filter"
                                checked={showSelectedDateOnly}
                                onCheckedChange={setShowSelectedDateOnly}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
                                Candidate Name
                            </label>
                            <input
                                type="text"
                                name="candidateName"
                                id="candidateName"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 shadow-sm transition duration-150"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}