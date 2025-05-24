import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { prompt, resumes } = await request.json();

        if (!prompt || !resumes || !Array.isArray(resumes) || resumes.length === 0) {
            return NextResponse.json({
                error: "Invalid request",
                message: "Please provide a prompt and an array of resumes"
            }, { status: 400 });
        }

        console.log("Starting clustering request with prompt:", prompt);
        console.log("Number of resumes to process:", resumes.length);

        // Check if Gemini API is available
        const useGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';
        
        if (useGemini) {
            try {
                const clusteringResult = await performGeminiClustering(prompt, resumes);
                return NextResponse.json(clusteringResult);
            } catch (apiError) {
                console.error("Gemini API error:", apiError);
                console.log("Falling back to enhanced mock implementation");
            }
        }
        
        // Fallback to mock implementation
        console.log("Using enhanced mock clustering implementation");
        const mockClusters = createEnhancedMockClusters(resumes, prompt);
        return NextResponse.json(mockClusters);
        
    } catch (error) {
        console.error("Clustering error:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message
        }, { status: 500 });
    }
}

async function performGeminiClustering(prompt, resumes) {
    console.log("Attempting Gemini 1.5 Flash API call...");
    
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

    // Enhanced prompt
    const enhancedPrompt = `
    Based on the prompt: "${prompt}"
    
    Analyze these ${resumes.length} resumes and group them into meaningful clusters.
    
    For each candidate in the results, ALWAYS include:
    - id (use the original ID)
    - name  
    - education
    - experience (job experience)
    - skills
    - reason (specific explanation for why they fit this cluster)
    
    Resume data:
    ${JSON.stringify(formattedResumes, null, 2)}
    
    Return a JSON response with this exact structure:
    {
      "groups": [
        {
          "name": "Group Name",
          "description": "Why these candidates are grouped together",
          "candidates": [
            {
              "id": "candidate_id",
              "name": "candidate_name",
              "education": "education_details",
              "experience": "job_experience_details", 
              "skills": "skills_details",
              "reason": "specific reason for this grouping - be detailed and specific"
            }
          ]
        }
      ],
      "summary": "Overall analysis summary",
      "totalCandidates": ${resumes.length},
      "aiPowered": true,
      "model": "gemini-1.5-flash"
    }
    
    IMPORTANT: The "reason" field should be specific and explain why each candidate belongs in their cluster based on their actual data.`;

    const modelOptions = {
        model: "gemini-1.5-flash",
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
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
    
    const maxRetries = 3;
    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
        try {
            console.log(`Making Gemini API call (attempt ${retryCount + 1}/${maxRetries})`);
            
            const result = await model.generateContent(enhancedPrompt);
            const response = result.response;
            const text = response.text();
            
            console.log("Received response from Gemini 1.5 Flash");
            
            // Parse JSON response
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(text);
            } catch (parseError) {
                // Try to extract JSON from code blocks
                const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[1]);
                } else {
                    const jsonStart = text.indexOf('{');
                    const jsonEnd = text.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                        const jsonText = text.substring(jsonStart, jsonEnd + 1);
                        parsedResponse = JSON.parse(jsonText);
                    } else {
                        throw new Error("Could not extract valid JSON from response");
                    }
                }
            }
            
            console.log("Successfully processed Gemini response");
            return parsedResponse;
            
        } catch (retryError) {
            console.error(`Attempt ${retryCount + 1} failed:`, retryError.message);
            
            if (retryCount === maxRetries - 1) {
                throw retryError;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount + 1) * 1000));
        }
    }
}

function createEnhancedMockClusters(resumes, prompt) {
    console.log("Creating enhanced mock clusters for prompt:", prompt);
    
    const promptLower = prompt.toLowerCase();
    let groups = [];
    
    const formatCandidate = (resume, reason) => ({
        id: resume.ID,
        name: resume.name || 'Unknown',
        education: resume.education || 'Not specified',
        experience: resume['job experience'] || 'Not specified',
        skills: resume.skills || 'Not specified',
        reason: reason
    });

    if (promptLower.includes("ai-generated") || promptLower.includes("ai generated")) {
        // AI-generated detection logic
        const potentialAI = resumes.filter(r => {
            const allText = [
                r.education || '',
                r.skills || '',
                r['job experience'] || '',
                r.name || ''
            ].join(' ').toLowerCase();
            
            const aiIndicators = [
                'leverage', 'utilize', 'spearheaded', 'orchestrated', 'synergize',
                'optimized', 'streamlined', 'enhanced', 'revolutionized', 'innovative'
            ];
            
            const indicatorCount = aiIndicators.filter(indicator => allText.includes(indicator)).length;
            return indicatorCount >= 3;
        }).map(r => formatCandidate(r, 
            `Contains multiple AI-generated buzzwords: ${['leverage', 'utilize', 'spearheaded', 'orchestrated', 'synergize', 'optimized', 'streamlined', 'enhanced', 'revolutionized', 'innovative']
                .filter(word => [r.education || '', r.skills || '', r['job experience'] || ''].join(' ').toLowerCase().includes(word))
                .join(', ')}`
        ));

        const likelyHuman = resumes.filter(r => {
            const allText = [r.education || '', r.skills || '', r['job experience'] || ''].join(' ').toLowerCase();
            const aiIndicators = ['leverage', 'utilize', 'spearheaded', 'orchestrated', 'synergize', 'optimized', 'streamlined', 'enhanced', 'revolutionized', 'innovative'];
            const indicatorCount = aiIndicators.filter(indicator => allText.includes(indicator)).length;
            return indicatorCount < 3;
        }).map(r => formatCandidate(r, "Uses natural language patterns with minimal corporate buzzwords"));

        if (potentialAI.length) groups.push({ 
            name: "Potential AI-Generated", 
            description: "Resumes showing possible AI generation patterns", 
            candidates: potentialAI 
        });
        if (likelyHuman.length) groups.push({ 
            name: "Likely Human-Written", 
            description: "Resumes with natural writing patterns", 
            candidates: likelyHuman 
        });
    }
    else if (promptLower.includes("experience") || promptLower.includes("year")) {
        // Experience-based clustering
        const senior = resumes.filter(r => {
            const exp = (r['job experience'] || '').toLowerCase();
            return exp.includes('senior') || exp.includes('lead') || exp.includes('manager');
        }).map(r => formatCandidate(r, 
            `Experience contains senior-level keywords: ${['senior', 'lead', 'manager']
                .filter(word => (r['job experience'] || '').toLowerCase().includes(word))
                .join(', ')}`
        ));

        const mid = resumes.filter(r => {
            const exp = (r['job experience'] || '').toLowerCase();
            return !exp.includes('senior') && !exp.includes('lead') && !exp.includes('manager') && exp.length > 50;
        }).map(r => formatCandidate(r, `Has substantial work experience (${r['job experience']?.length || 0} characters) without senior-level titles`));

        const junior = resumes.filter(r => {
            const exp = (r['job experience'] || '').toLowerCase();
            return exp.length <= 50;
        }).map(r => formatCandidate(r, `Limited work experience description (${r['job experience']?.length || 0} characters), likely entry-level`));

        if (senior.length) groups.push({ name: "Senior Level", description: "Candidates with senior-level experience", candidates: senior });
        if (mid.length) groups.push({ name: "Mid Level", description: "Candidates with mid-level experience", candidates: mid });
        if (junior.length) groups.push({ name: "Junior Level", description: "Candidates with junior-level experience", candidates: junior });
    }
    else if (promptLower.includes("education") || promptLower.includes("degree")) {
        // Education-based clustering
        const masters = resumes.filter(r => {
            const edu = (r.education || '').toLowerCase();
            return edu.includes('master') || edu.includes('mba') || edu.includes('phd');
        }).map(r => formatCandidate(r, 
            `Education includes advanced degree: ${['master', 'mba', 'phd']
                .filter(word => (r.education || '').toLowerCase().includes(word))
                .join(', ')}`
        ));

        const bachelors = resumes.filter(r => {
            const edu = (r.education || '').toLowerCase();
            return edu.includes('bachelor') || (edu.includes('degree') && !edu.includes('master'));
        }).map(r => formatCandidate(r, `Education includes bachelor's degree or undergraduate qualification`));

        const others = resumes.filter(r => {
            const edu = (r.education || '').toLowerCase();
            return !edu.includes('bachelor') && !edu.includes('master') && !edu.includes('mba') && !edu.includes('phd');
        }).map(r => formatCandidate(r, `Alternative educational background: diploma, certification, or other qualification`));

        if (masters.length) groups.push({ name: "Advanced Degrees", description: "Candidates with Master's, MBA, or PhD", candidates: masters });
        if (bachelors.length) groups.push({ name: "Bachelor's Degrees", description: "Candidates with Bachelor's degrees", candidates: bachelors });
        if (others.length) groups.push({ name: "Other Education", description: "Candidates with other educational backgrounds", candidates: others });
    }
    else {
        // Default clustering by status
        const shortlisted = resumes.filter(r => r.shortlisted === 'shortlisted')
            .map(r => formatCandidate(r, "Currently marked as shortlisted in the system"));
        const pending = resumes.filter(r => r.shortlisted !== 'shortlisted')
            .map(r => formatCandidate(r, "Status is pending review or not yet shortlisted"));

        if (shortlisted.length) groups.push({ name: "Shortlisted", description: "Currently shortlisted candidates", candidates: shortlisted });
        if (pending.length) groups.push({ name: "Pending Review", description: "Candidates pending review", candidates: pending });
    }

    return {
        groups,
        summary: `Mock clustering based on "${prompt}" criteria. Grouped ${resumes.length} candidates into ${groups.length} clusters with specific reasoning for each placement.`,
        totalCandidates: resumes.length,
        aiPowered: false,
        model: "mock-enhanced"
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

export async function updateStatus(request) {
    try {
        const { rowId, newStatus } = await request.json();

        if (!rowId || !newStatus) {
            return NextResponse.json({
                error: "Missing required fields",
                message: "Both rowId and newStatus are required"
            }, { status: 400 });
        }

        console.log(`Updating resume ${rowId} status to ${newStatus}`);

        const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/update', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
                'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
            },
            body: JSON.stringify({
                data: { shortlisted: newStatus },
                table_id: process.env.JAMAI_ACTION_TABLE_ID,
                row_id: rowId
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('JamAI API error:', errorData);
            throw new Error(`JamAI API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Status update successful:', result);

        return NextResponse.json({
            success: true,
            message: "Status updated successfully",
            data: result
        });

    } catch (error) {
        console.error("Status update error:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message
        }, { status: 500 });
    }
}