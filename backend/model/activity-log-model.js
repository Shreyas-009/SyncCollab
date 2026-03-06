import mongoose from "mongoose";

const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: 'Unknown User'
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATED_TASK', 'UPDATED_TASK', 'UPDATED_STATUS', 'DELETED_TASK', 'PROJECT_CREATED']
    },
    taskSnapshot: {
        type: String, // String summary of the task state at the time of action
        default: ''
    }
}, { timestamps: true });

// Index for getting logs by project for the last N days quickly
activityLogSchema.index({ projectId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
