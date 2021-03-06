'use strict';

import mongoose from 'mongoose';

let ResourceSchema = new mongoose.Schema({
    title:     { type: String, required: true },
    info:      String,
    url:       { type: String, required: true },
    org:       { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceOrg' },
    tags:      [String],
    rating:    { type: Number, min: 0, max: 5 },
    upvotes:   { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    github:    {
                created_at: Date,
                updated_at: Date,
                open_issues_count: Number,
                forks_count: Number
    }
  },
  { timestamps: true }  // createdAt, updatedAt
);

// convert all tags to lowercase before saving
ResourceSchema.pre("save", function(next) {
  this.tags = this.tags.map( t => t.toLowerCase() );
  next();
});

function date2String(date) {
  let options = {
    weekday: 'long', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

ResourceSchema.methods.getCreatedAt = function() {
  return date2String(this.createdAt);
};

ResourceSchema.methods.getUpdatedAt = function() {
  return date2String(this.updatedAt);
};

export default mongoose.model('Resource', ResourceSchema);
