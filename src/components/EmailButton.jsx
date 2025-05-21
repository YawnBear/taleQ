export default function EmailButton({ candidateId, email, name, details, onEmailSent, isNotified }) {
    const handleSendEmail = async () => {
        if (isNotified) return;
        
        try {
            const response = await fetch('/api/notify-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    name,
                    details 
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
            title={isNotified ? "Email already sent" : "Send Interview Notification"}
            className={`p-1.5 rounded-full text-xs
                ${isNotified 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'}
                transition-colors duration-200 flex items-center justify-center`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
        </button>
    );
}