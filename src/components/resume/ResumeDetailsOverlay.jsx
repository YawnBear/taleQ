import { useEffect, useState } from "react";

export default function ResumeDetailsOverlay({ resumeId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to convert JSON content to readable strings
  const parseJsonToString = (content) => {
    if (!content || content === 'null') return null; // Return null instead of empty string
    
    try {
      let parsedData;
      
      // Check if content contains markdown code blocks
      const markdownMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        let jsonContent = markdownMatch[1];
        
        // Fix malformed JSON with unquoted division expressions
        jsonContent = jsonContent.replace(/:\s*(\d+\/\d+)/g, ': "$1"');
        
        parsedData = JSON.parse(jsonContent);
      } else if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
        // Try to parse as JSON if it's a JSON string
        // Fix malformed JSON with unquoted division expressions
        let fixedContent = content.replace(/:\s*(\d+\/\d+)/g, ': "$1"');
        parsedData = JSON.parse(fixedContent);
      } else {
        // Return as-is if not JSON
        return content;
      }

      // Add debugging for shortlisted reasons
      if (parsedData && parsedData.results) {
        console.log('Found shortlisted reasons data:', parsedData);
      }

      // Convert parsed JSON to readable string format
      return convertJsonToReadableString(parsedData);
    } catch (error) {
      // If parsing fails, return original content
      console.error('Failed to parse JSON:', error, 'Content:', content);
      return content;
    }
  };

  // Helper function to convert JSON objects to readable strings
  const convertJsonToReadableString = (data) => {
    if (!data) return '';

    if (Array.isArray(data)) {
      return data.map((item, index) => {
        if (typeof item === 'object') {
          // Special formatting for job experience
          if (item.job_title && item.company) {
            return `${index + 1}. ${item.job_title} at ${item.company}\n` +
                   `   Duration: ${item.start_date} - ${item.end_date}\n` +
                   `   Responsibilities: ${item.responsibilities}`;
          }
          
          // General object formatting
          return `${index + 1}. ${Object.entries(item)
            .filter(([key, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
            .join(', ')}`;
        }
        return `${index + 1}. ${item}`;
      }).join('\n\n');
    }

    if (typeof data === 'object') {
      // Handle contact links
      if (data.GitHub || data.LinkedIn || data.Instagram || data.Portfolio || data.Other) {
        return Object.entries(data)
          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
          .map(([key, value]) => `• ${key}: ${value}`)
          .join('\n');
      }

      // Handle education format
      if (data.high_school || data.university || data.pre_university || data.diploma) {
        const sections = [];
        if (data.high_school) {
          sections.push(`• High School: ${data.high_school.qualification} from ${data.high_school.institution} (${data.high_school.year})`);
        }
        if (data.pre_university) {
          sections.push(`• Pre-University: ${data.pre_university.programme} at ${data.pre_university.institution}`);
        }
        if (data.diploma) {
          sections.push(`• Diploma: ${data.diploma.qualification} from ${data.diploma.institution}${data.diploma.field_of_study ? ` (${data.diploma.field_of_study})` : ''}`);
        }
        if (data.university) {
          sections.push(`• University: ${data.university.qualification} from ${data.university.institution}${data.university.course ? ` - ${data.university.course}` : ''}${data.university.graduation_year ? ` (Expected graduation: ${data.university.graduation_year})` : ''}`);
        }
        return sections.join('\n');
      }

      // Handle curriculum activities format
      if (data.activities) {
        return data.activities.map((activity, index) => 
          `${index + 1}. ${activity.role} at ${activity.name} (${activity.date})\n   ${activity.description}`
        ).join('\n\n');
      }

      // Handle skills format
      if (data.technical_skills || data.soft_skills) {
        const sections = [];
        if (data.technical_skills) {
          sections.push(`Technical Skills:\n${data.technical_skills.map(skill => `• ${skill}`).join('\n')}`);
        }
        if (data.soft_skills) {
          sections.push(`Languages:\n${data.soft_skills.map(skill => `• ${skill}`).join('\n')}`);
        }
        return sections.join('\n\n');
      }

      // Handle shortlisted reasons format - FIXED: Check for results property first
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((result, index) => {
          const jobTitle = result.job_title || 'Unknown Position';
          const totalScore = result.total_suitability_score || 'N/A';
          const educationScore = result.education_score || 'N/A';
          const experienceScore = result.experience_score || 'N/A';
          const skillsScore = result.skills_score || 'N/A';
          const educationReason = result.education_reason || 'No reason provided';
          const experienceReason = result.experience_reason || 'No reason provided';
          const skillsReason = result.skills_reason || 'No reason provided';

          return `${index + 1}. ${jobTitle} (Overall Score: ${totalScore})\n` +
                 `   • Education Score: ${educationScore} - ${educationReason}\n` +
                 `   • Experience Score: ${experienceScore} - ${experienceReason}\n` +
                 `   • Skills Score: ${skillsScore} - ${skillsReason}`;
        }).join('\n\n');
      }

      // Handle general objects
      return Object.entries(data)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length === 0) return null;
          return `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        })
        .filter(item => item !== null)
        .join('\n');
    }

    return data.toString();
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/view-resume?id=${resumeId}&action=details`);
        const data = await res.json();

        if (data.success) {
          const transformedDetails = Object.entries(data.details).reduce((acc, [key, value]) => {
            const rawValue = typeof value === 'object' && value !== null 
              ? value.value || JSON.stringify(value) 
              : value;
            
            // Parse JSON content to readable string while preserving all info
            acc[key] = parseJsonToString(rawValue);
            return acc;
          }, {});
          
          setDetails(transformedDetails);
        } else {
          console.error("Failed to fetch resume details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching resume details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchDetails();
    }
  }, [resumeId]);

  const handleViewResume = () => {
    const viewUrl = `/api/view-resume?id=${resumeId}&action=view`;
    window.open(viewUrl, '_blank');
  };

  if (!details && !loading) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : details ? (
          <>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{details.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                {details['email address'] && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {details['email address']}
                  </div>
                )}
                {details['contact number'] && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {details['contact number']}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="grid gap-6">
                {details['contact links'] && details['contact links'] !== 'null' && details['contact links'] !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Contact Links
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details['contact links']}</p>
                    </div>
                  </div>
                )}

                {details.education && details.education !== 'null' && details.education !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Education
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details.education}</p>
                    </div>
                  </div>
                )}

                {details['job experience'] && details['job experience'] !== 'null' && details['job experience'] !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                      </svg>
                      Experience
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details['job experience']}</p>
                    </div>
                  </div>
                )}

                {details['curriculum activities'] && details['curriculum activities'] !== 'null' && details['curriculum activities'] !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Curriculum Activities
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details['curriculum activities']}</p>
                    </div>
                  </div>
                )}

                {details.skills && details.skills !== 'null' && details.skills !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Skills
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details.skills}</p>
                    </div>
                  </div>
                )}

                {details.projects && details.projects !== 'null' && details.projects !== '' && details.projects !== null && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Projects
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details.projects}</p>
                    </div>
                  </div>
                )}

                {details.achievements && details.achievements !== 'null' && details.achievements !== '' && details.achievements !== null && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Achievements
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details.achievements}</p>
                    </div>
                  </div>
                )}

                {details.certifications && details.certifications !== 'null' && details.certifications !== 'No certifications listed' && details.certifications !== '' && details.certifications !== null && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Certifications
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details.certifications}</p>
                    </div>
                  </div>
                )}

                {details['shortlisted reasons'] && details['shortlisted reasons'] !== 'null' && details['shortlisted reasons'] !== '' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Shortlisted Reasons
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{details['shortlisted reasons']}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
              <button
                onClick={handleViewResume}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Resume
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-md hover:from-emerald-500 hover:to-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Failed to load resume</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}