var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;
exports.mongoose = mongoose;

// Database connect
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';

var mongoOptions = { db: { safe: true }};

mongoose.connect(uristring, mongoOptions, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + uristring);
  }
});

//******* Database schema TODO add more validation
var Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;

// User schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  admin: { type: Boolean, required: true },
});

// Bcrypt middleware
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Remember Me implementation helper method
userSchema.methods.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for ( var x = 0; x < 16; x++ ) {
    var i = Math.floor( Math.random() * 62 );
    token += chars.charAt( i );
  }
  return token;
};


// Export user model
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;


//  ========== Token Schema ==========

var tokenSchema = new Schema({
  accessToken: { type: String, required: true, unique: true },
  usernameid: { type: String, required: true, unique: true },
});

tokenSchema.methods.consumeRememberMeToken= function(token, fn) {
  var uid = token.usernameid;
  token.remove();
  return fn(null, uid);
};
var tokenModel = mongoose.model('Token', tokenSchema);
exports.tokenModel = tokenModel;

//  ========== Report Schema ==========

var reportSchema = new Schema({
  method: { type: Number, required: true}, // 1:R, 2:Server, 3:Client
  testgroup: { type: Number, required: true},
  dpsize: { type: Number, required: true},
  stage: { type: Number, required: true},
  description: { type: String, required: true},
  time: { type: Number, required: true}, //ms
});

var reportModel = mongoose.model('Report', reportSchema);
exports.reportModel = reportModel;



