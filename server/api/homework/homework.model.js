'use strict';

import mongoose from 'mongoose-fill';   // mongoose-fill monkey-patches mongoose.

var HomeworkSchema = new mongoose.Schema({
  title: String,
  info: String,
  url: String,
  cohort : { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
  assignedOnDate : { type : Date },
  dueDate : { type : Date }
});

(function() {
  /**
   * Autopopulate hook
   */
  var autoPopulate = function(next) {
    this.populate('cohort');
    next();
  };

  HomeworkSchema.
  pre('findOne', autoPopulate).
  pre('find'   , autoPopulate);
})();

module.exports = mongoose.model('Homework', HomeworkSchema);
