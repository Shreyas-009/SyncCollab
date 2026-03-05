import mongoose from "mongoose";
import crypto from "crypto";

const Schema = mongoose.Schema;

const projectInviteLinkSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },
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
    createdBy: {
        type: String,
        required: true
    },
    createdByName: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for fast token lookup
projectInviteLinkSchema.index({ token: 1 });
projectInviteLinkSchema.index({ projectId: 1, createdBy: 1 });

export default mongoose.model('ProjectInviteLink', projectInviteLinkSchema);
