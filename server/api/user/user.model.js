'use strict';

let crypto = require('crypto');

import mongoose from 'mongoose-fill';   // mongoose-fill monkey-patches mongoose.

let Attendance = require('../attendance/attendance.model');
let Project = require('../project/project.model');

let UserSchema = new mongoose.Schema({
  name: String,
  email:  { type: String, lowercase: true },
  role:   { type: String, default: 'student' },
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
  squad:  { type: mongoose.Schema.Types.ObjectId, ref: 'Squad' },
  attendance: [ Attendance.schema ],
  projects: [ Project.schema ],
  password: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

(function() {

  const authTypes = ['github', 'twitter', 'facebook', 'google'];

  /**
   * Virtuals
   */

  // Public profile information
  UserSchema
    .virtual('profile')
    .get(function() {
      return {
        'name': this.name,
        'role': this.role
      };
    });

  // Non-sensitive info we'll be putting in the token
  UserSchema
    .virtual('token')
    .get(function() {
      return {
        '_id': this._id,
        'role': this.role
      };
    });

  /**
   * Validations
   */

  // Validate empty email
  UserSchema
    .path('email')
    .validate(function(email) {
      if (authTypes.indexOf(this.provider) !== -1) {
        return true;
      }
      return email.length;
    }, 'Email cannot be blank');

  // Validate empty password
  UserSchema
    .path('password')
    .validate(function(password) {
      if (authTypes.indexOf(this.provider) !== -1) {
        return true;
      }
      return password.length;
    }, 'Password cannot be blank');

  // Validate email is not taken
  UserSchema
    .path('email')
    .validate(function(value, respond) {
      let self = this;
      return this.constructor.findOne({ email: value }).exec()
        .then(function(user) {
          if (user) {
            if (self.id === user.id) {
              return respond(true);
            }
            return respond(false);
          }
          return respond(true);
        })
        .catch(function(err) {
          throw err;
        });
    }, 'The specified email address is already in use.');

  let validatePresenceOf = function(value) {
    return value && value.length;
  };

  /**
   * Pre-save hook
   */
  UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if (!this.isModified('password')) {
      return next();
    }

    if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
      return next(new Error('Invalid password'));
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if (saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if (encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        return next();
      });
    });
  });

  UserSchema
  .post('save', function(next) {
    // console.log('Saved user:', this);
  });

  UserSchema
  .fill('groupProjects', function(callback) {
    this.db.model('GroupProject')
    .find( { team: this._id } ).populate('team', '_id name email github')
    .exec(callback);
  });

  /**
   * Autopopulate hook
   */
  let autoPopulate = function(next) {
    this.populate('cohort');
    this.populate('squad');
    this.fill('groupProjects');   // TODO: why doesn't this work?
    next();
  };

  UserSchema.
  pre('findOne', autoPopulate).
  pre('find'   , autoPopulate);

  /**
   * Methods
   */
  UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} password
     * @param {Function} callback
     * @return {Boolean}
     * @api public
     */
    authenticate(password, callback) {
      if (!callback) {
        return this.password === this.encryptPassword(password);
      }

      this.encryptPassword(password, (err, pwdGen) => {
        if (err) {
          return callback(err);
        }

        if (this.password === pwdGen) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      });
    },

    /**
     * Make salt
     *
     * @param {Number} byteSize Optional salt byte size, default to 16
     * @param {Function} callback
     * @return {String}
     * @api public
     */
    makeSalt(byteSize, callback) {
      let defaultByteSize = 16;

      if (typeof arguments[0] === 'function') {
        callback = arguments[0];
        byteSize = defaultByteSize;
      } else if (typeof arguments[1] === 'function') {
        callback = arguments[1];
      }

      if (!byteSize) {
        byteSize = defaultByteSize;
      }

      if (!callback) {
        return crypto.randomBytes(byteSize).toString('base64');
      }

      return crypto.randomBytes(byteSize, (err, salt) => {
        if (err) {
          callback(err);
        } else {
          callback(null, salt.toString('base64'));
        }
      });
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @param {Function} callback
     * @return {String}
     * @api public
     */
    encryptPassword(password, callback) {
      if (!password || !this.salt) {
        return null;
      }

      let defaultIterations = 10000;
      let defaultKeyLength = 64;
      let salt = new Buffer(this.salt, 'base64');

      if (!callback) {
        return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
                     .toString('base64');
      }

      return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, (err, key) => {
        if (err) {
          callback(err);
        } else {
          callback(null, key.toString('base64'));
        }
      });
    }
  };
})();

module.exports = mongoose.model('User', UserSchema);
