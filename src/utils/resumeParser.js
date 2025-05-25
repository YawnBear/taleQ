/**
 * Parse contact links from JSON string
 * @param {string} contactLinksValue - The contact links value from backend
 * @returns {string} - Formatted contact links
 */
export const parseContactLinks = (contactLinksValue) => {
  if (!contactLinksValue || contactLinksValue === 'null') return '';
  
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = contactLinksValue.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : contactLinksValue;
    
    const contactLinks = JSON.parse(jsonString);
    const validLinks = [];
    
    Object.entries(contactLinks).forEach(([platform, url]) => {
      if (url && url !== null && url !== 'null') {
        validLinks.push(`• ${platform.replace(/&amp;/g, '&')}`);
      }
    });
    
    return validLinks.join('\n') || 'No contact links';
  } catch (error) {
    console.error('Error parsing contact links:', error);
    return contactLinksValue;
  }
};

/**
 * Parse education from JSON string
 * @param {string} educationValue - The education value from backend
 * @returns {string} - Formatted education
 */
export const parseEducation = (educationValue) => {
  if (!educationValue || educationValue === 'null') return '';
  
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = educationValue.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : educationValue;
    
    const education = JSON.parse(jsonString);
    const educationLevels = [];
    
    if (education.high_school?.institution) {
      educationLevels.push(`• High School: ${education.high_school.institution.replace(/&amp;/g, '&')}`);
    }
    
    if (education.pre_university?.institution) {
      educationLevels.push(`• Pre-University: ${education.pre_university.institution.replace(/&amp;/g, '&')}`);
    }
    
    if (education.university?.institution) {
      educationLevels.push(`• University: ${education.university.institution.replace(/&amp;/g, '&')}`);
    }
    
    return educationLevels.join('\n') || 'No education info';
  } catch (error) {
    console.error('Error parsing education:', error);
    return educationValue;
  }
};

/**
 * Parse job experience from JSON string
 * @param {string} jobExperienceValue - The job experience value from backend
 * @returns {string} - Formatted job experience
 */
export const parseJobExperience = (jobExperienceValue) => {
  if (!jobExperienceValue || jobExperienceValue === 'null') return '';
  
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = jobExperienceValue.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : jobExperienceValue;
    
    const experiences = JSON.parse(jsonString);
    
    if (!Array.isArray(experiences)) return 'No job experience';
    
    const formattedExperiences = experiences.map(exp => {
      const startDate = exp.start_date || '';
      const endDate = exp.end_date || '';
      const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : '';
      const jobTitle = (exp.job_title || 'Unknown Position').replace(/&amp;/g, '&');
      
      return `• ${jobTitle}${dateRange ? `: ${dateRange}` : ''}`;
    });
    
    return formattedExperiences.join('\n') || 'No job experience';
  } catch (error) {
    console.error('Error parsing job experience:', error);
    return jobExperienceValue;
  }
};

/**
 * Parse curriculum activities from JSON string
 * @param {string} curriculumValue - The curriculum activities value from backend
 * @returns {string} - Formatted curriculum activities
 */
export const parseCurriculumActivities = (curriculumValue) => {
  if (!curriculumValue || curriculumValue === 'null') return '';
  
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = curriculumValue.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : curriculumValue;
    
    const curriculum = JSON.parse(jsonString);
    
    if (!curriculum.activities || !Array.isArray(curriculum.activities)) {
      return 'No curriculum activities';
    }
    
    const formattedActivities = curriculum.activities.map(activity => {
      const role = (activity.role || 'Member').replace(/&amp;/g, '&');
      const name = (activity.name || activity.organization || 'Unknown Organization').replace(/&amp;/g, '&');
      return `• ${role} at ${name}`;
    });
    
    return formattedActivities.join('\n') || 'No curriculum activities';
  } catch (error) {
    console.error('Error parsing curriculum activities:', error);
    return curriculumValue;
  }
};

/**
 * Parse skills from JSON string
 * @param {string} skillsValue - The skills value from backend
 * @returns {string} - Formatted skills
 */
export const parseSkills = (skillsValue) => {
  if (!skillsValue || skillsValue === 'null') return '';
  
  try {
    const skills = JSON.parse(skillsValue);
    const skillCategories = [];
    
    if (skills.technical_skills && Array.isArray(skills.technical_skills)) {
      const technicalSkills = skills.technical_skills.map(skill => skill.replace(/&amp;/g, '&')).join(', ');
      skillCategories.push(`Technical Skills:\n${technicalSkills}`);
    }
    
    if (skills.soft_skills && Array.isArray(skills.soft_skills)) {
      const softSkills = skills.soft_skills.map(skill => skill.replace(/&amp;/g, '&')).join(', ');
      skillCategories.push(`Soft Skills:\n${softSkills}`);
    }
    
    return skillCategories.join('\n\n') || 'No skills listed';
  } catch (error) {
    console.error('Error parsing skills:', error);
    return skillsValue;
  }
};

/**
 * Parse achievements from JSON string
 * @param {string} achievementsValue - The achievements value from backend
 * @returns {string} - Formatted achievements
 */
export const parseAchievements = (achievementsValue) => {
  if (!achievementsValue || achievementsValue === 'null' || achievementsValue === 'null') {
    return 'No achievements listed';
  }
  
  try {
    // If it's already a string description, return it with bullet
    if (typeof achievementsValue === 'string' && !achievementsValue.startsWith('{')) {
      return `• ${achievementsValue.replace(/&amp;/g, '&')}`;
    }
    
    const achievements = JSON.parse(achievementsValue);
    
    if (Array.isArray(achievements)) {
      return achievements.map(achievement => {
        const text = typeof achievement === 'string' ? achievement : 
                    (achievement.title || achievement.name || achievement.description || 'Achievement');
        return `• ${text.replace(/&amp;/g, '&')}`;
      }).join('\n');
    } else if (typeof achievements === 'object') {
      return Object.values(achievements).map(value => `• ${value.replace(/&amp;/g, '&')}`).join('\n');
    }
    
    return 'No achievements listed';
  } catch (error) {
    console.error('Error parsing achievements:', error);
    return achievementsValue;
  }
};

/**
 * Parse shortlisted reasons from JSON string
 * @param {string} shortlistedReasonsValue - The shortlisted reasons value from backend
 * @returns {string} - Formatted shortlisted reasons
 */
export const parseShortlistedReasons = (shortlistedReasonsValue) => {
  if (!shortlistedReasonsValue || shortlistedReasonsValue === 'null') return '';
  
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = shortlistedReasonsValue.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : shortlistedReasonsValue;
    
    // Clean up common JSON issues
    let cleanedJson = jsonString
      .replace(/(\d+)\/(\d+)/g, '"$1/$2"') // Fix unquoted fractions like 8/10
      .replace(/(\w+)_score:/g, '"$1_score":') // Fix unquoted property names
      .replace(/(\w+)_reason:/g, '"$1_reason":') // Fix unquoted property names
      .replace(/total_suitability_score:/g, '"total_suitability_score":') // Fix this specific property
      .replace(/job_title:/g, '"job_title":') // Fix job_title property
      .replace(/education_score:/g, '"education_score":') // Fix education_score
      .replace(/education_reason:/g, '"education_reason":') // Fix education_reason
      .replace(/experience_score:/g, '"experience_score":') // Fix experience_score
      .replace(/experience_reason:/g, '"experience_reason":') // Fix experience_reason
      .replace(/skills_score:/g, '"skills_score":') // Fix skills_score
      .replace(/skills_reason:/g, '"skills_reason":') // Fix skills_reason
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const reasonsData = JSON.parse(cleanedJson);
    
    if (!reasonsData.results || !Array.isArray(reasonsData.results)) {
      return 'No evaluation results';
    }
    
    const formattedReasons = reasonsData.results.map(result => {
      const jobTitle = (result.job_title || 'Unknown Position').replace(/&amp;/g, '&');
      const score = result.total_suitability_score || 'N/A';
      return `• ${jobTitle}: ${score}`;
    });
    
    return formattedReasons.join('\n') || 'No evaluation results';
  } catch (error) {
    console.error('Error parsing shortlisted reasons:', error);
    console.error('Raw value:', shortlistedReasonsValue);
    
    // Fallback: try to extract basic info using regex
    try {
      const jobTitleMatches = shortlistedReasonsValue.match(/"job_title":\s*"([^"]+)"/g);
      const scoreMatches = shortlistedReasonsValue.match(/"total_suitability_score":\s*"?([^",\s}]+)"?/g);
      
      if (jobTitleMatches && scoreMatches) {
        const results = [];
        const minLength = Math.min(jobTitleMatches.length, scoreMatches.length);
        
        for (let i = 0; i < minLength; i++) {
          const jobTitle = jobTitleMatches[i].match(/"job_title":\s*"([^"]+)"/)[1].replace(/&amp;/g, '&');
          const score = scoreMatches[i].match(/"total_suitability_score":\s*"?([^",\s}]+)"?/)[1];
          results.push(`• ${jobTitle}: ${score}`);
        }
        
        return results.join('\n') || 'No evaluation results';
      }
    } catch (regexError) {
      console.error('Regex fallback also failed:', regexError);
    }
    
    return 'Invalid evaluation data format';
  }
};