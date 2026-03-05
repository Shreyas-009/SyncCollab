import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectInviteSchema = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    projectColor: {
        type: String,
        default: '#8B5CF6'
    },
    fromUserId: {
        type: String,
        required: true,
        index: true
    },
    fromUserEmail: {
        type: String,
        default: ''
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
    }
}, { timestamps: true });

// Index for finding pending invites
projectInviteSchema.index({ toUserId: 1, status: 1 });

export default mongoose.model('ProjectInvite', projectInviteSchema);
