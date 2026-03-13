import mongoose from "mongoose";

const Schema = mongoose.Schema;

const todoSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'testing', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    taskType: {
        type: String,
        enum: ['feature', 'bug-fix', 'design', 'refactor', 'testing', 'documentation', 'other'],
        default: ''
    },
    startDate: {
        type: Date,
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    assignedTo: {
        type: String, // User ID of assignee
        default: ''
    },
    assignedToName: {
        type: String,
        default: ''
    },
    assignedToImage: {
        type: String,
        default: ''
    },
    assignedToRole: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        required: true
    },
    createdByName: {
        type: String,
        default: ''
    },
    createdByImage: {
        type: String,
        default: ''
    },
    updatedBy: {
        type: String,
        default: ''
    },
    updatedByName: {
        type: String,
        default: ''
    },
    updatedByImage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Todo', todoSchema);