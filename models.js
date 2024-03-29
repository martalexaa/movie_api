const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Define movieSchema for Movie model
var movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

// Define userSchema for User model
var userSchema = mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Define a static method on userSchema to hash a password using bcryptjs
/**
 * Hashes a password using bcryptjs.
 *
 * @param {string} password - The password to be hashed.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcryptjs.hashSync(password, 10);
};

// Define an instance method on userSchema to validate a password using bcryptjs
/**
 * Validates a password by comparing it with the stored hashed password.
 *
 * @param {string} password - The password to be validated.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function (password) {
  return bcryptjs.compareSync(password, this.Password);
};

// Create Movie and User models using the defined schemas
var Movie = mongoose.model('Movie', movieSchema);
var User = mongoose.model('User', userSchema);

// Export the Movie and User models
module.exports.Movie = Movie;
module.exports.User = User;
