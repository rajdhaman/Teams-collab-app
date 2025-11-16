const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
name: {
type: String,
required: true,
trim: true
},
description: {
type: String,
trim: true
},
teamId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Team',
required: true,
index: true
},
createdBy: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},
status: {
type: String,
enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
default: 'ACTIVE'
},
startDate: Date,
endDate: Date
}, {
timestamps: true
});
projectSchema.index({ teamId: 1, status: 1 });
module.exports = mongoose.model('Project', projectSchema);