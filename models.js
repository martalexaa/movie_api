const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

var movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
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

var userSchema = mongoose.Schema({
    Username: {type: String, required: true, unique: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true, unique: true},
    Birthday: Date, 
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

 userSchema.statics.hashPassword = (password) => {
    return bcryptjs.hashSync(password, 10);  
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcryptjs.compareSync(password, this.Password);
  };

var Movie = mongoose.model('Movie', movieSchema);
var User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;