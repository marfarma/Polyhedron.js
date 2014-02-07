var expect = chai.expect;
var Polyhedron = require('polyhedron');

// var db = Polyhedron.datastore('mongodb://localhost:27017/kongo');
// var Users = db.doctype('Users');
// 
// users = Users.find({}, {sort: ['createdAt', -1], limit: 10});
// newUser = Users.insert({name: 'Ryan'});
// newUser._id // Some id set by /pouchDB/mongo
// 
// anotherUser = Users.save({name: 'Matt'});
// anotherUser.name = 'Matthew';
// Users.save(anotherUser);
// mattCount = yield User.count({name: 'Matthew'});
// mattCount == 1; // true


describe("Mocha Setup", function() {
  describe("browser support", function() {
    it("library should load", function() {
      expect(Polyhedron).to.be.defined;
    });
  });
});