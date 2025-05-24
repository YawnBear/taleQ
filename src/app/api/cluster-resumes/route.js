import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { prompt, resumes } = body;

        if (!prompt || !resumes || !Array.isArray(resumes) || resumes.length === 0) {
            return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
        }

        console.log("Starting clustering request with prompt:", prompt);
        console.log("Number of resumes to process:", resumes.length);

        // Always try Gemini first with optimized settings
        let useGemini = true;
        
        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            console.log("GEMINI_API_KEY not configured, using mock implementation");
            useGemini = false;
        }

        if (useGemini) {
            try {
                console.log("Attempting to make Gemini 1.5 Flash API call...");
                
                // Initialize the Gemini API with optimized settings
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                
                // Format resume data for AI processing
                const formattedResumes = resumes.map(resume => ({
                    id: resume.ID,
                    name: resume.name || 'Unknown',
                    education: resume.education || 'Not specified',
                    skills: resume.skills || 'Not specified',
                    experience: resume['job experience'] || 'Not specified',
                    currentStatus: resume.shortlisted || 'pending'
                }));

                // Optimized model configuration for Gemini 1.5 Flash
                const modelOptions = {
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        maxOutputTokens: 8192, // Increased for better responses
                        temperature: 0.1, // Lower temperature for more consistent results
                        topK: 40,
                        topP: 0.95,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE",
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE",
                        },
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE", 
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE",
                        },
                    ],
                };
                
                const model = genAI.getGenerativeModel(modelOptions);
                
                // Optimize resume data for token efficiency
                const optimizedResumes = formattedResumes.slice(0, 50).map(resume => ({
                    id: resume.id,
                    name: resume.name,
                    education: truncateText(resume.education, 150),
                    skills: truncateText(resume.skills, 150),
                    experience: truncateText(resume.experience, 200),
                    status: resume.currentStatus
                }));
                
                // Enhanced prompt for better AI understanding
                const enhancedPrompt = `You are an expert HR analyst tasked with clustering resume candidates. 

CLUSTERING REQUEST: "${prompt}"

CANDIDATE DATA:
${JSON.stringify(optimizedResumes, null, 2)}

INSTRUCTIONS:
1. Analyze each candidate's education, skills, and experience
2. Create logical groups based on the clustering request
3. Ensure every candidate is assigned to exactly one group
4. Provide clear reasoning for each assignment
5. Create 2-5 meaningful groups (avoid too many small groups)

REQUIRED JSON OUTPUT FORMAT:
{
  "groups": [
    {
      "name": "Clear Group Name",
      "description": "Brief explanation of what defines this group",
      "candidates": [
        {
          "id": "candidate_id",
          "name": "Candidate Name", 
          "matchReason": "Specific reason why this candidate fits this group"
        }
      ]
    }
  ],
  "summary": "Brief overview of the clustering analysis and key findings"
}

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.`;

                console.log("Making optimized Gemini 1.5 Flash API call...");
                
                // Add retry logic for rate limiting
                let retryCount = 0;
                const maxRetries = 3;
                let result;
                
                while (retryCount < maxRetries) {
                    try {
                        result = await model.generateContent(enhancedPrompt);
                        break; // Success, exit retry loop
                    } catch (retryError) {
                        retryCount++;
                        
                        if (retryError.message && retryError.message.includes('429')) {
                            // Rate limit hit, wait before retry
                            const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                            console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                        } else {
                            throw retryError; // Non-rate-limit error, don't retry
                        }
                    }
                }
                
                if (!result) {
                    throw new Error('Failed to get response after retries');
                }
                
                const response = result.response;
                const content = response.text();
                
                console.log("Received response from Gemini 1.5 Flash");
                console.log("Response preview:", content.substring(0, 200) + "...");
                
                // Enhanced JSON parsing with multiple fallback strategies
                let clusteredData;
                
                try {
                    // Strategy 1: Direct JSON parse
                    clusteredData = JSON.parse(content);
                    console.log("Successfully parsed JSON directly");
                } catch (jsonError1) {
                    console.log("Direct JSON parse failed, trying extraction methods...");
                    
                    try {
                        // Strategy 2: Extract JSON from code blocks
                        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                        if (codeBlockMatch) {
                            clusteredData = JSON.parse(codeBlockMatch[1]);
                            console.log("Successfully parsed JSON from code block");
                        } else {
                            throw new Error("No code block found");
                        }
                    } catch (jsonError2) {
                        try {
                            // Strategy 3: Extract largest JSON object
                            const jsonMatches = content.match(/\{[\s\S]*\}/g);
                            if (jsonMatches && jsonMatches.length > 0) {
                                // Try the largest JSON object
                                const largestJson = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
                                clusteredData = JSON.parse(largestJson);
                                console.log("Successfully parsed largest JSON object");
                            } else {
                                throw new Error("No JSON objects found");
                            }
                        } catch (jsonError3) {
                            // Strategy 4: Clean and try again
                            try {
                                const cleanedContent = content
                                    .replace(/```json\s*/g, '')
                                    .replace(/```\s*/g, '')
                                    .replace(/^\s*[\w\s]*?(\{)/, '$1')
                                    .replace(/(\})\s*[\w\s]*?$/, '$1');
                                
                                clusteredData = JSON.parse(cleanedContent);
                                console.log("Successfully parsed cleaned JSON");
                            } catch (jsonError4) {
                                console.error("All JSON parsing strategies failed");
                                console.error("Original content:", content);
                                throw new Error('Unable to parse AI response as valid JSON');
                            }
                        }
                    }
                }
                
                // Validate the parsed data structure
                if (!clusteredData || !clusteredData.groups || !Array.isArray(clusteredData.groups)) {
                    throw new Error('Invalid response structure from AI');
                }
                
                // Merge original resume data back into candidates
                for (const group of clusteredData.groups) {
                    if (!Array.isArray(group.candidates)) {
                        group.candidates = [];
                        continue;
                    }
                    
                    group.candidates = group.candidates.map(candidate => {
                        const originalResume = resumes.find(r => r.ID === candidate.id);
                        if (!originalResume) {
                            console.warn(`Original resume not found for candidate ID: ${candidate.id}`);
                            return candidate;
                        }
                        return {
                            ...originalResume,
                            matchReason: candidate.matchReason || "Grouped by AI analysis"
                        };
                    });
                }
                
                // Add AI-powered flag to response
                clusteredData.aiPowered = true;
                clusteredData.model = "gemini-1.5-flash";
                
                console.log("Successfully processed Gemini response");
                return NextResponse.json(clusteredData);
                
            } catch (apiError) {
                console.error('Gemini API call error:', apiError);
                
                // Check if it's a rate limit error and we should fallback
                if (apiError.message && (
                    apiError.message.includes('429') || 
                    apiError.message.includes('quota') || 
                    apiError.message.includes('rate limit') ||
                    apiError.message.includes('RATE_LIMIT_EXCEEDED')
                )) {
                    console.log("Rate limit exceeded after retries, falling back to mock implementation");
                    useGemini = false;
                } else {
                    // For parsing or other API errors, still try to return a meaningful response
                    console.log("API error encountered, falling back to mock implementation");
                    useGemini = false;
                }
            }
        }
        
        // Fallback to enhanced mock implementation
        if (!useGemini) {
            console.log("Using enhanced mock clustering implementation");
            const mockResults = createEnhancedMockClusters(prompt, resumes);
            return NextResponse.json(mockResults);
        }
        
    } catch (error) {
        console.error('Clustering API error:', error);
        
        return NextResponse.json({ 
            message: 'Failed to cluster resumes', 
            error: error.message
        }, { status: 500 });
    }
}

// Enhanced mock implementation as fallback
function createEnhancedMockClusters(prompt, resumes) {
    const promptLower = prompt.toLowerCase();
    const groups = [];
    
    console.log("Creating enhanced mock clusters for prompt:", prompt);
    
    // Multi-criteria clustering logic
    let clustered = false;
    
    // 1. Computer Science + Skills combination (your example)
    if ((promptLower.includes("computer science") || promptLower.includes("cs")) && 
        (promptLower.includes("python") || promptLower.includes("skills"))) {
        
        const perfectMatches = {
            name: "CS Graduates with Python Skills",
            description: "Candidates with Computer Science background and Python expertise",
            candidates: []
        };
        
        const csOnly = {
            name: "CS Graduates (No Python)",
            description: "Computer Science graduates without Python skills",
            candidates: []
        };
        
        const pythonOnly = {
            name: "Python Developers (Non-CS)",
            description: "Python developers without Computer Science degrees",
            candidates: []
        };
        
        const others = {
            name: "Other Candidates",
            description: "Candidates not matching CS or Python criteria",
            candidates: []
        };
        
        resumes.forEach(resume => {
            const education = (resume.education || "").toLowerCase();
            const skills = (resume.skills || "").toLowerCase();
            const experience = (resume["job experience"] || "").toLowerCase();
            
            const hasCS = education.includes("computer science") || education.includes("cs") || 
                         education.includes("computer engineering") || education.includes("software engineering");
            const hasPython = skills.includes("python") || experience.includes("python");
            
            if (hasCS && hasPython) {
                perfectMatches.candidates.push({
                    ...resume,
                    matchReason: "Has Computer Science degree AND Python skills"
                });
            } else if (hasCS && !hasPython) {
                csOnly.candidates.push({
                    ...resume,
                    matchReason: "Has Computer Science degree but no Python skills mentioned"
                });
            } else if (!hasCS && hasPython) {
                pythonOnly.candidates.push({
                    ...resume,
                    matchReason: "Has Python skills but no Computer Science degree"
                });
            } else {
                others.candidates.push({
                    ...resume,
                    matchReason: "Neither Computer Science degree nor Python skills found"
                });
            }
        });
        
        [perfectMatches, csOnly, pythonOnly, others].forEach(group => {
            if (group.candidates.length > 0) groups.push(group);
        });
        
        clustered = true;
    }
    
    // 2. Experience-based clustering
    else if (promptLower.includes("experience") || promptLower.includes("year")) {
        const yearMatches = promptLower.match(/(\d+)[\s-]*(?:years?|yrs?)/g) || [];
        
        if (yearMatches.length > 0) {
            const targetYears = Math.max(...yearMatches.map(match => parseInt(match.match(/\d+/)[0])));
            
            groups.push({
                name: `${targetYears}+ Years Experience`,
                description: `Experienced candidates with ${targetYears} or more years`,
                candidates: resumes.filter(r => estimateExperience(r) >= targetYears)
                    .map(r => ({ ...r, matchReason: `Has ${estimateExperience(r)} years of experience` }))
            });
            
            groups.push({
                name: `Less than ${targetYears} Years`,
                description: `Candidates with less than ${targetYears} years of experience`,
                candidates: resumes.filter(r => estimateExperience(r) < targetYears)
                    .map(r => ({ ...r, matchReason: `Has ${estimateExperience(r)} years of experience` }))
            });
        } else {
            // Default experience grouping
            groups.push(
                {
                    name: "Senior (5+ years)",
                    description: "Senior candidates with extensive experience",
                    candidates: resumes.filter(r => estimateExperience(r) >= 5)
                        .map(r => ({ ...r, matchReason: "Senior level with 5+ years experience" }))
                },
                {
                    name: "Mid-level (2-5 years)",
                    description: "Mid-level candidates with moderate experience",
                    candidates: resumes.filter(r => estimateExperience(r) >= 2 && estimateExperience(r) < 5)
                        .map(r => ({ ...r, matchReason: "Mid-level with 2-5 years experience" }))
                },
                {
                    name: "Junior (0-2 years)",
                    description: "Junior candidates or fresh graduates",
                    candidates: resumes.filter(r => estimateExperience(r) < 2)
                        .map(r => ({ ...r, matchReason: "Junior level with 0-2 years experience" }))
                }
            );
        }
        clustered = true;
    }
    
    // 3. Skills-based clustering
    else if (promptLower.includes("skills") || containsSkillKeywords(promptLower)) {
        const detectedSkills = extractSkillsFromPrompt(promptLower);
        
        detectedSkills.forEach(skill => {
            const skillGroup = {
                name: `${skill.toUpperCase()} Specialists`,
                description: `Candidates with ${skill} expertise`,
                candidates: []
            };
            
            resumes.forEach(resume => {
                const skills = (resume.skills || "").toLowerCase();
                const experience = (resume["job experience"] || "").toLowerCase();
                
                if (skills.includes(skill) || experience.includes(skill)) {
                    const alreadyGrouped = groups.some(g => g.candidates.some(c => c.ID === resume.ID));
                    if (!alreadyGrouped) {
                        skillGroup.candidates.push({
                            ...resume,
                            matchReason: `Has ${skill} expertise in skills or experience`
                        });
                    }
                }
            });
            
            if (skillGroup.candidates.length > 0) {
                groups.push(skillGroup);
            }
        });
        
        clustered = true;
    }
    
    // 4. Fallback: General keyword matching
    if (!clustered) {
        return createKeywordGroups(resumes, prompt);
    }
    
    // Ensure all candidates are included
    const alreadyGrouped = new Set();
    groups.forEach(group => {
        group.candidates.forEach(candidate => {
            alreadyGrouped.add(candidate.ID);
        });
    });
    
    const ungroupedCandidates = resumes.filter(r => !alreadyGrouped.has(r.ID));
    
    if (ungroupedCandidates.length > 0) {
        groups.push({
            name: "Ungrouped Candidates",
            description: "Candidates not fitting primary clustering criteria",
            candidates: ungroupedCandidates.map(r => ({
                ...r,
                matchReason: "Doesn't match the primary clustering criteria"
            }))
        });
    }
    
    return {
        groups: groups.filter(group => group.candidates.length > 0),
        summary: `Enhanced mock analysis of ${resumes.length} resumes for "${prompt}". Created ${groups.length} distinct groups.`,
        aiPowered: false,
        model: "enhanced-mock"
    };
}

// Helper functions (keeping existing ones and adding new ones)

function extractSkillsFromPrompt(prompt) {
    const skillKeywords = [
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'nodejs',
        'php', 'ruby', 'c++', 'c#', 'swift', 'kotlin', 'go', 'rust',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes',
        'git', 'jenkins', 'ci/cd', 'devops', 'machine learning', 'ai'
    ];
    
    return skillKeywords.filter(skill => prompt.includes(skill));
}

function containsSkillKeywords(prompt) {
    return extractSkillsFromPrompt(prompt).length > 0;
}

function createKeywordGroups(resumes, prompt) {
    const commonWords = ['group', 'candidates', 'with', 'and', 'or', 'the', 'a', 'an', 'by', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are'];
    const keywords = prompt.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
    
    if (keywords.length === 0) {
        return {
            groups: [{
                name: "All Candidates",
                description: "All available candidates",
                candidates: resumes.map(r => ({ ...r, matchReason: "Included in general grouping" }))
            }],
            summary: `General grouping of ${resumes.length} candidates`
        };
    }
    
    const matchingGroup = {
        name: `Relevant Candidates`,
        description: `Candidates matching criteria from: "${prompt}"`,
        candidates: []
    };
    
    const nonMatchingGroup = {
        name: "Other Candidates",
        description: "Candidates not matching the specified criteria",
        candidates: []
    };
    
    resumes.forEach(resume => {
        const searchText = [
            resume.education || "",
            resume.skills || "",
            resume["job experience"] || "",
            resume.name || ""
        ].join(" ").toLowerCase();
        
        const matchedKeywords = keywords.filter(keyword => searchText.includes(keyword));
        
        if (matchedKeywords.length > 0) {
            matchingGroup.candidates.push({
                ...resume,
                matchReason: `Matches keywords: ${matchedKeywords.join(', ')}`
            });
        } else {
            nonMatchingGroup.candidates.push({
                ...resume,
                matchReason: "No matching keywords found"
            });
        }
    });
    
    const groups = [];
    if (matchingGroup.candidates.length > 0) groups.push(matchingGroup);
    if (nonMatchingGroup.candidates.length > 0) groups.push(nonMatchingGroup);
    
    return {
        groups,
        summary: `Keyword-based analysis of ${resumes.length} resumes for "${prompt}"`
    };
}

function estimateExperience(resume) {
    const experience = (resume["job experience"] || "").toLowerCase();
    
    // Look for explicit year mentions
    const yearMatches = experience.match(/(\d+)[\s-]*(?:years?|yrs?)/g) || [];
    if (yearMatches.length > 0) {
        const years = yearMatches.map(match => parseInt(match.match(/\d+/)[0]));
        return Math.max(...years);
    }
    
    // Count job positions as rough estimate
    const positionIndicators = ['at ', 'company', 'worked', 'employed', 'position', 'role'];
    let positions = 0;
    positionIndicators.forEach(indicator => {
        const matches = experience.split(indicator).length - 1;
        positions += matches;
    });
    
    return Math.max(1, Math.min(positions, 10)); // Cap at 10 years
}

function truncateText(text, maxLength) {
    if (typeof text !== 'string' || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}