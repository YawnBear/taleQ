export default function EmailButton({ candidateId, email, name, type, onEmailSent, isNotified }) {
    const getEmailDetails = (type) => {
        if (type === 'accepted') {
            return {
                subject: "Interview Invitation from TaleQ",
                details: `Interview Schedule: Monday, 27 May 2025, 10:00 AM
                        Location: TaleQ Office, Level 2, Building A
                        Type: In-person interview
                        Duration: 1 hour`
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
        if (isNotified) return;
        
        try {
            const emailContent = getEmailDetails(type);
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
            
            onEmailSent(candidateId);
            alert('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Failed to send email: ${error.message}`);
        }
    };

    return (
        <button
            onClick={handleSendEmail}
            disabled={isNotified}
            title={isNotified ? "Email already sent" : `Send ${type === 'accepted' ? 'Interview' : 'Rejection'} Notification`}
            className={`p-1.5 rounded-full text-xs
                ${isNotified 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : type === 'accepted'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'}
                transition-colors duration-200 flex items-center justify-center`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
        </button>
    );
}