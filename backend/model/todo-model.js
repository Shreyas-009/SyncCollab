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
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
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