const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const websiteSchema = new Schema({
    name: { type: String, required: true },
    title: String,
    description: String,
    ip_adress: String,
    location: String,
    favicon_url: String,
    css_url: String,
    online: { type: Boolean, default: false },
    tld: String,
    secure: { type: Boolean, default: false },
    techstack: [String],
    back_end_stack: [String],
    colorScheme: [{
        name: String,
        code: String
    }],
    fonts: [String],
    contactName: String,
    contactAdress: String,
    fullLink: String,
    hostingProvider: [String],
    AI_Overview: String
}, { timestamps: true });

const Web = mongoose.model('Web', websiteSchema, 'Web')
module.exports = Web