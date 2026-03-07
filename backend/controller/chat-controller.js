import { GoogleGenerativeAI } from '@google/generative-ai';
import ActivityLog from '../model/activity-log-model.js';
import Project from '../model/project-model.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

export const getProjectChatResponse = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message, internalType } = req.body;
        const userId = req.userId;

        if (!projectId) return res.status(400).json({ message: 'Project ID is required' });
        if (!message) return res.status(400).json({ message: 'Message is required' });

        // Check if user has access to this project
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ ownerId: userId }, { 'collaborators.id': userId }]
        });

        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this project' });
        }

        // Fetch activity logs for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await ActivityLog.find({
            projectId,
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: 1 }); // Ascending order

        // Handle Insufficient Data Scenario
        if (logs.length === 0) {
            return res.status(200).json({
                success: true,
                response: `### Insufficient Data\n\nThe activity logs do not contain enough information to answer this question.`,
                allowPDF: false
            });
        }

        // Format date compactly: "Mar 7, 9:04 AM"
        const formatDate = (date) => {
            return new Date(date).toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        };

        // Humanize action labels
        const actionLabels = {
            CREATED_TASK: 'Created Task',
            UPDATED_TASK: 'Updated Task',
            UPDATED_STATUS: 'Status Updated',
            DELETED_TASK: 'Deleted Task',
            PROJECTCREATED: 'Project Created',
            PROJECT_CREATED: 'Project Created',
            ADDED_COLLABORATOR: 'Added Collaborator',
            REMOVED_COLLABORATOR: 'Removed Collaborator',
        };
        const humanizeAction = (action) => actionLabels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Structure logs as JSON objects
        const structuredLogs = logs.map(log => ({
            date: formatDate(log.createdAt),
            user: log.userName,
            action: humanizeAction(log.action),
            task: log.taskSnapshot || "N/A"
        }));

        // Hidden instruction mapping
        const suggestionMapping = {
            report: "Generate a full structured project activity report. Include a single activity table, key insights, most active collaborators, task status changes, and observations. Use markdown tables.",
            summary: "Provide a concise executive summary of the project activity. Focus on important updates, key task changes, and overall progress.",
            updates: "List the most recent project updates in a markdown table with columns Date, User, Action, Task.",
            blockers: "Analyze activity patterns and identify potential blockers, stalled tasks, or unusual workflow behavior."
        };

        const hiddenInstruction = internalType ? suggestionMapping[internalType] : "";

        // Build System Prompt Context
        let contextString = `You are Nexus, an expert project activity analyst inside the SyncCollab platform. The project is named "${project.name}".
Your task is to analyze the last 30 days of project activity logs and answer user questions.

### SYSTEM RULES & FORMATTING
1. Provide highly structured, concise, and reliable responses.
2. Avoid long paragraphs. Prefer concise bullet points and bolding for emphasis.
3. Always output valid Markdown. Use ## for section titles and ### for subsections.
4. When listing events or updates, ALWAYS use a Markdown table formatted as:
   | Date | User | Action | Task |
   |------|------|--------|------|
5. Highlight important entities (like user names and task titles) using **bold**.
6. NEVER invent information. Only use the provided structured JSON logs. If asked something outside the logs, remind the user you only know about project activity.
7. Observe patterns: most active collaborator, frequently updated tasks, status toggling, or workflow inefficiencies. Note these under 'Key Insights' or 'Observations'.
8. Maximum 8 bullet points per section.

Here is the structured project activity data formatted as JSON:
${JSON.stringify(structuredLogs, null, 2)}
`;

        // Combine system context + user message
        let finalPrompt = `${contextString}\n\nUser Question: ${message}`;
        if (hiddenInstruction) {
            finalPrompt += `\nInternal Instructions (Follow strictly): ${hiddenInstruction}`;
        }

        const result = await model.generateContent(finalPrompt);
        const responseText = result.response.text();

        // Calculate allowPDF flag
        const isReportRequested = typeof message === 'string' && message.toLowerCase().includes('report');
        const isReportType = internalType === 'report';
        const hasSummaryHeader = responseText.includes('Project Activity Summary') || responseText.includes('Activity Table');
        
        const allowPDF = isReportRequested || isReportType || hasSummaryHeader;

        return res.status(200).json({
            success: true,
            response: responseText,
            allowPDF: allowPDF
        });

    } catch (error) {
        console.error('Chat AI Error:', error);
        return res.status(500).json({ message: error.message || 'Failed to generate chat response' });
    }
};
