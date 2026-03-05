import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    ownerEmail: {
        type: String,
        default: ''
    },
    ownerName: {
        type: String,
        default: ''
    },
    ownerImage: {
        type: String,
        default: ''
    },
    collaborators: [{
        id: { type: String, required: true },
        email: { type: String, default: '' },
        name: { type: String, default: '' },
        image: { type: String, default: '' }
    }],
    color: {
        type: String,
        default: '#8B5CF6' // Purple default
    }
}, { timestamps: true });

// Index for finding projects where user is owner OR collaborator
projectSchema.index({ ownerId: 1, 'collaborators.id': 1 });

export default mongoose.model('Project', projectSchema);
