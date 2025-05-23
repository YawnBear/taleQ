"use client";

import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, isSameDay, startOfWeek, addDays } from 'date-fns';
import BookingModal from './BookingModal';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showSelectedDateOnly, setShowSelectedDateOnly] = useState(true);
    const dropdownRef = useRef(null);

    // Time slots from 10 AM to 5 PM, 1.5 hour intervals
    const timeSlots = [
        "10:00", "11:30", "13:00", "14:30", "16:00"
    ];

    useEffect(() => {
        // Fetch interviews from localStorage or API
        const savedInterviews = localStorage.getItem('interviews');
        if (savedInterviews) {
            setInterviews(JSON.parse(savedInterviews));
        }

        // Add click event listener to close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSelectedDate(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Modified CSS to prevent layout shift when scrollbar appears
    useEffect(() => {
      // Add a class to the HTML element to always reserve space for scrollbar
      document.documentElement.classList.add('overflow-y-scroll');
      
      return () => {
        // Clean up when component unmounts
        document.documentElement.classList.remove('overflow-y-scroll');
      };
    }, []);

    // Get calendar days including padding days for correct alignment
    const getDaysInMonth = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfMonth(currentDate);
        const days = [];
        let day = start;

        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }

        // Add days to complete the last week
        while (days.length % 7 !== 0) {
            days.push(addDays(days[days.length - 1], 1));
        }

        return days;
    };

    const daysInMonth = getDaysInMonth();

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    };

    const handleDateClick = (date) => {
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Exclude weekends
            setSelectedDate(date);
        }
    };

    const handleSlotClick = (time) => {
        setSelectedSlot(time);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBookSlot = (bookingData) => {
        const { candidateName, email, date, showSelectedDateOnly: newShowSelectedDateOnly } = bookingData;
        
        // Create a new booking
        const newBooking = {
            id: Date.now().toString(),
            candidateName,
            email,
            date,
            time: selectedSlot
        };
        
        // Update the interviews in localStorage
        const updatedInterviews = [...interviews, newBooking];
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
        setInterviews(updatedInterviews);
        
        // Save the display preference
        setShowSelectedDateOnly(newShowSelectedDateOnly);
        
        // Close the modal
        handleCloseModal();
    };

    const isSlotBooked = (date, time) => {
        return interviews.some(interview => 
            isSameDay(new Date(interview.date), date) && interview.time === time
        );
    };

    // Add a function to check if a date has any interviews scheduled
    const hasInterviewsOnDate = (date) => {
        return interviews.some(interview => 
            isSameDay(new Date(interview.date), date)
        );
    };

    // Sort interviews by date and time
    const sortedInterviews = [...interviews].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() === dateB.getTime()) {
            return a.time.localeCompare(b.time);
        }
        return dateA - dateB;
    });

    // Add this new function above the return statement
    const handleDeleteInterview = (id) => {
        const updatedInterviews = interviews.filter(interview => interview.id !== id);
        setInterviews(updatedInterviews);
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
    };

    // Filter interviews based on the toggle
    const filteredInterviews = showSelectedDateOnly && selectedDate
        ? interviews.filter(interview => {
            const interviewDate = new Date(interview.date);
            return isSameDay(interviewDate, selectedDate);
          })
        : interviews;

    return (
        <div className="w-full max-w-7xl mx-auto p-8 space-y-8">
            <div className="bg-white rounded-lg shadow">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <button 
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-emerald-50 rounded-full"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <button 
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-emerald-50 rounded-full"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                    {daysInMonth.map((date, idx) => (
                        <div
                            key={date.toISOString()}
                            onClick={() => date.getDay() !== 0 && date.getDay() !== 6 && handleDateClick(date)}
                            className={`bg-white p-2 h-32 relative ${
                                !isSameMonth(date, currentDate) ? 'text-gray-400' :
                                isToday(date) ? 'bg-emerald-50' :
                                date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-50' : ''
                            } ${date.getDay() !== 0 && date.getDay() !== 6 ? 'cursor-pointer hover:bg-emerald-50' : ''}`}
                        >
                            <div className="flex items-start justify-between">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        selectedDate && isSameDay(date, selectedDate)
                                            ? 'bg-green-500 text-white'
                                            : ''
                                    }`}
                                >
                                    {format(date, 'd')}
                                </div>
                                
                                {/* Indicator for dates with booked slots */}
                                {hasInterviewsOnDate(date) && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                )}
                            </div>
                            
                            {/* Booking indicator on non-selected dates */}
                            {hasInterviewsOnDate(date) && !isSameDay(date, selectedDate) && (
                                <div className="h-1 w-12 bg-green-200 rounded mt-1 mx-auto"></div>
                            )}

                            {isSameDay(date, selectedDate) && (
                                <div 
                                    ref={dropdownRef} 
                                    className="mt-2 space-y-1 relative z-20 bg-white shadow-lg rounded p-1"
                                >
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the date click from triggering
                                                handleSlotClick(time);
                                            }}
                                            disabled={isSlotBooked(date, time)}
                                            className={`w-full text-xs p-1 rounded ${
                                                isSlotBooked(date, time)
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Import and use the BookingModal component */}
            <BookingModal
                isOpen={showModal}
                onClose={handleCloseModal}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onBookSlot={handleBookSlot}
            />

            {/* Scheduled Interviews Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Scheduled Interviews</h2>
                    <label className="flex items-center cursor-pointer">
                        <span className="text-sm text-gray-500 mr-2">
                            Show selected date only
                        </span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={showSelectedDateOnly}
                                onChange={() => setShowSelectedDateOnly(prev => !prev)}
                                className="sr-only"
                            />
                            {/* Track - changes color when toggled */}
                            <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                                showSelectedDateOnly ? 'bg-green-500' : 'bg-gray-200'
                            }`}></div>
                            {/* Thumb - always stays white for better contrast */}
                            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                showSelectedDateOnly ? 'translate-x-4' : ''
                            }`}></div>
                        </div>
                    </label>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredInterviews.length > 0 ? (
                        filteredInterviews.map((interview, index) => (
                            <div key={interview.id || `interview-${index}`} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {interview.candidateName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {interview.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-right mr-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {format(new Date(interview.date), 'EEEE, MMMM d, yyyy')}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {interview.time}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteInterview(interview.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete interview"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            {showSelectedDateOnly && selectedDate
                                ? "No interviews scheduled for this date." 
                                : "No interviews scheduled."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}