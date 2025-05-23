import { useEffect, useState } from "react";
import { format, addMinutes } from 'date-fns';

export default function EmailButton({ candidateId, email, name, type, onEmailSent, isNotified: propIsNotified }) {
    const [nextAvailableTime, setNextAvailableTime] = useState(null);
    const [isCheckingSlots, setIsCheckingSlots] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [defaultTime, setDefaultTime] = useState(() => {
        // Get tomorrow's date at 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        // Make sure it's not on a weekend
        const dayOfWeek = tomorrow.getDay();
        if (dayOfWeek === 0) { // Sunday
            tomorrow.setDate(tomorrow.getDate() + 1); // Move to Monday
        } else if (dayOfWeek === 6) { // Saturday
            tomorrow.setDate(tomorrow.getDate() + 2); // Move to Monday
        }
        
        return tomorrow;
    });
    
    // Use a local state that syncs with both props and localStorage
    const [isLocalNotified, setIsLocalNotified] = useState(false);
    
    // Check localStorage on mount to ensure the button remains disabled after navigation
    useEffect(() => {
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        const alreadySent = sentEmails.includes(candidateId);
        setIsLocalNotified(propIsNotified || alreadySent);
    }, [candidateId, propIsNotified]);

    // Function to fetch booked slots from calendar
    const getBookedSlots = async () => {
        try {
            const bookedSlotsStr = localStorage.getItem('interviews');
            return bookedSlotsStr ? JSON.parse(bookedSlotsStr) : [];
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            return [];
        }
    };

    // Find the next available time slot
    const findNextAvailableSlot = async (startTime) => {
        setIsCheckingSlots(true);
        try {
            const bookedSlots = await getBookedSlots();
            let proposedTime = new Date(startTime);
            let isSlotAvailable = false;
            
            // Keep checking until we find an available slot
            while (!isSlotAvailable) {
                // Check if the time is during revised working hours (10 AM to 4:30 PM)
                const hours = proposedTime.getHours();
                const minutes = proposedTime.getMinutes();
                const dayOfWeek = proposedTime.getDay(); // 0 is Sunday, 6 is Saturday
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isWorkingHours = (hours > 10 || (hours === 10 && minutes >= 0)) && 
                                      (hours < 16 || (hours === 16 && minutes <= 30));
                
                // If it's a weekend or outside working hours, move to next working day/hour
                if (isWeekend || !isWorkingHours) {
                    if (isWeekend) {
                        // If weekend, move to Monday 10 AM
                        proposedTime = new Date(proposedTime);
                        proposedTime.setDate(proposedTime.getDate() + (dayOfWeek === 0 ? 1 : 2)); // +1 for Sunday, +2 for Saturday
                        proposedTime.setHours(10, 0, 0, 0); // 10 AM
                    } else if (hours < 10) {
                        // If before work hours, set to 10 AM same day
                        proposedTime.setHours(10, 0, 0, 0);
                    } else {
                        // If after work hours, set to 10 AM next day
                        proposedTime.setDate(proposedTime.getDate() + 1);
                        proposedTime.setHours(10, 0, 0, 0);
                    }
                    continue; // Restart the check with the new time
                }
                
                // Format the time as "HH:MM" for comparison
                const timeString = format(proposedTime, 'HH:mm');
                
                // Check if this time is already booked
                const isBooked = bookedSlots.some(slot => {
                    const slotDate = new Date(slot.date);
                    return format(slotDate, 'yyyy-MM-dd') === format(proposedTime, 'yyyy-MM-dd') && 
                           slot.time === timeString;
                });
                
                if (!isBooked) {
                    isSlotAvailable = true;
                } else {
                    // Move to next slot (add 90 minutes)
                    proposedTime = addMinutes(proposedTime, 90);
                    
                    // If this pushes us outside working hours, adjust
                    const newHours = proposedTime.getHours();
                    const newMinutes = proposedTime.getMinutes();
                    
                    if (newHours > 16 || (newHours === 16 && newMinutes > 30)) {
                        // Move to next day at 10 AM
                        proposedTime.setDate(proposedTime.getDate() + 1);
                        proposedTime.setHours(10, 0, 0, 0);
                    }
                }
            }
            
            return proposedTime;
        } catch (error) {
            console.error("Error finding available slot:", error);
            return startTime; // Fall back to original time if there's an error
        } finally {
            setIsCheckingSlots(false);
        }
    };

    const getEmailDetails = (type, interviewTime) => {
        if (type === 'accepted') {
            const formattedDate = format(interviewTime, 'EEEE, d MMMM yyyy');
            const formattedTime = format(interviewTime, 'h:mm a');
            
            return {
                subject: "Interview Invitation from TaleQ",
                details: `Interview Schedule: ${formattedDate}, ${formattedTime}
                        Location: TaleQ Office, Level 2, Building A
                        Type: In-person interview
                        Duration: 1 hour`,
                time: interviewTime
            };
        } else {
            return {
                subject: "Application Status Update from TaleQ",
                details: `Thank you for your interest in joining TaleQ.
                        After careful consideration, we regret to inform you that we will not be proceeding with your application at this time.
                        We appreciate the time you invested in applying and wish you success in your future endeavors.`
            };
        }
    };

    const handleSendEmail = async () => {
        // Check both prop isNotified and localStorage before proceeding
        if (isLocalNotified) return;
        
        try {
            setIsCheckingSlots(type === 'accepted');
            setIsLoading(true);
            
            // Only find available slot for accepted candidates
            let interviewTime = defaultTime;
            if (type === 'accepted') {
                interviewTime = await findNextAvailableSlot(defaultTime);
                setNextAvailableTime(interviewTime);
            }
            
            const emailContent = getEmailDetails(type, interviewTime);
            
            const response = await fetch('/api/notify-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    name,
                    details: emailContent.details,
                    subject: emailContent.subject
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }
            
            // If it's an interview invitation, store the booking in localStorage
            if (type === 'accepted') {
                const bookedSlots = await getBookedSlots();
                bookedSlots.push({
                    date: interviewTime,
                    time: format(interviewTime, 'HH:mm'),
                    candidateName: name,
                    email: email
                });
                localStorage.setItem('interviews', JSON.stringify(bookedSlots));
            }
            
            // Mark as notified in localStorage to persist across navigation
            const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
            sentEmails.push(candidateId);
            localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
            
            // Update local state
            setIsLocalNotified(true);
            
            // Also update parent component state
            onEmailSent(candidateId);
            
            // Show different success message based on type
            if (type === 'accepted') {
                const day = format(interviewTime, 'EEEE');
                const date = format(interviewTime, 'd MMM yyyy');
                const time = format(interviewTime, 'h:mm a');
                
                if (format(defaultTime, 'HH:mm') !== format(interviewTime, 'HH:mm')) {
                    alert(`Interview scheduled: ${day}, ${date} at ${time} (adjusted to avoid conflicts)`);
                } else {
                    alert(`Interview scheduled: ${day}, ${date} at ${time}`);
                }
            } else {
                alert('Rejection email sent successfully');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Failed to send email: ${error.message}`);
        } finally {
            setIsCheckingSlots(false);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSendEmail}
            disabled={isLocalNotified || isLoading}
            title={isLocalNotified 
                ? "Email already sent" 
                : isCheckingSlots 
                    ? "Checking available time slots..." 
                    : isLoading
                        ? "Sending email..."
                        : `Send ${type === 'accepted' ? 'Interview' : 'Rejection'} Notification`}
            className={`p-1.5 rounded-full text-xs
                ${isLocalNotified 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isCheckingSlots
                        ? 'bg-yellow-100 text-yellow-800 cursor-wait'
                        : isLoading
                            ? (type === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')
                            : type === 'accepted'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'}
                transition-colors duration-200 flex items-center justify-center`}
        >
            {/* Show spinner for both accepted and rejected when loading */}
            {(isCheckingSlots || isLoading) ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
            )}
        </button>
    );
}