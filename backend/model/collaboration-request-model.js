import mongoose from "mongoose";

const Schema = mongoose.Schema;

const collaborationRequestSchema = new Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo',
        required: true
    },
    fromUserId: {
        type: String,
        required: true,
        index: true
    },
    fromUserEmail: {
        type: String,
        required: true
    },
    fromUserName: {
        type: String,
        default: ''
    },
    fromUserImage: {
        type: String,
        default: ''
    },
    toUserId: {
        type: String,
        required: true,
        index: true
    },
    toUserEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    taskTitle: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Compound index for efficient queries
collaborationRequestSchema.index({ toUserId: 1, status: 1 });
collaborationRequestSchema.index({ fromUserId: 1, status: 1 });

export default mongoose.model('CollaborationRequest', collaborationRequestSchema);
