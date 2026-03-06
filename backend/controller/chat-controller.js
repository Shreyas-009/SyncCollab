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
        const { message } = req.body;
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

        // Format the context for Gemini
        let contextString = `You are a helpful AI assistant for a project management tool. The project is named "${project.name}".\n`;
        contextString += `Here is the activity log for this project over the last 30 days:\n\n`;

        if (logs.length === 0) {
            contextString += "No activity recorded in the last 30 days.\n";
        } else {
            logs.forEach(log => {
                const date = new Date(log.createdAt).toLocaleString();
                contextString += `[${date}] ${log.userName} performed ${log.action}: ${log.taskSnapshot}\n`;
            });
        }

        contextString += `\nBased strictly on the logs provided above, answer the user's question.\n`;
        contextString += `Formatting instructions:\n`;
        contextString += `- Be extremely concise and structured.\n`;
        contextString += `- If the user asks for a table or tabular form, provide a well-formatted markdown table with clear columns (e.g., Date, Time, User, Action, Details).\n`;
        contextString += `- Use bullet points for summarizing multiple events or actions.\n`;
        contextString += `- Use bold text for user names, action types, or task titles to make them stand out.\n`;
        contextString += `Never invent information not present in the logs. If the user asks something outside the scope of the project activity, kindly remind them your primary knowledge is limited to the project logs.\n`;

        // Combine system context + user message
        const prompt = `${contextString}\nUser: ${message}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({
            success: true,
            response: responseText
        });

    } catch (error) {
        console.error('Chat AI Error:', error);
        return res.status(500).json({ message: error.message || 'Failed to generate chat response' });
    }
};
