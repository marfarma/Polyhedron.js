"use strict";

var chai = require('chai'),
   Q = global.Promise = require("q"),
   //Q = Promise = global.Promise || require('bluebird'),
   PouchDB = require('pouchdb'),
   expect = chai.expect,
   should = chai.should(),
   chaiAsPromised = require('chai-as-promised'),
   Polyhedron = require('../polyhedron.js'),
   helper = require('./helper.js'),
   exec = require('child_process').exec,
   testUtils = require('./utils.js');
   //platform    = require('platform'),

// function cleanup() {
//  // Remove test databases and test allDbs database.
//   exec('rm -r ' + testsDir);
// }
// 
// exec('mkdir -p ' + testsDir, function () {
//   process.on('SIGINT', cleanup);
//   process.on('exit', cleanup);
// });


require('mocha-as-promised')();
chai.use(chaiAsPromised);

if (Q) {
  Q.longStackSupport = true;
}

// polyfill for phantomjs browser
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this: oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

describe("Library Interface:", function () {
  
  beforeEach(function () {
     // TODO: try with the $q library
    testUtils.cleanupTestDatabases();
    Polyhedron.config.setQ(Q);
  });
  
  describe("basic configuration:", function () {
    
    it("should load", function () {      
      Q.all([
        Polyhedron.should.be.defined,
        expect(typeof Polyhedron).to.equal('object')
      ]);
    });
    
    it("create database should return a promise", function () {
      var db = new Polyhedron.Datastore(PouchDB, 'testDb');
      var throwaway = db.should.be.fullfilled;
    });
    
    it("should create a database", function () {
      var db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.should.eventually.be.an.instanceof(Polyhedron.Datastore);
    });
    
    it("should create another database", function () {
      var db, db2;
      db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.then(function (data) {
        db2 = new Polyhedron.Datastore(PouchDB, 'testDb2');
        Q.all([
          db2.should.eventually.have.property('server').that.equals(data.server),
          db2.should.eventually.have.property('db').that.is.not.equal(data.db)
        ]);
      });
    });   
    it('should return existing database when called repeatedly', function () { 
      var db, db2;
      db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.then(function (data) {
        db2 = new Polyhedron.Datastore(PouchDB, 'testDb');
        Q.all([
          db2.should.eventually.have.property('server').that.equals(data.server),
          db2.should.eventually.have.property('db').that.equals(data.db)
        ]);
      });
    });
    it('should return a list of database on server', function () { 
      var db, db2;
      db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db2 = new Polyhedron.Datastore(PouchDB, 'testDb2');
      Q.all([
        db,
        db2
      ]).then(function (data) {
        var list = Polyhedron.Datastores(PouchDB);
        list.should.have.members(['testDb', 'testDb2']);
      });
    });
    // TODO: fix delete database support
    it.skip('should delete a database', function () { 
      var db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.then(
        function (data) {
          var promise = data.destroy().then(
            function (info) {
              if (typeof info !== 'undefined') { console.log(info); }
              var list = Polyhedron.Datastores(PouchDB);
              console.log(list);
              //list.should.have.members(['testDb', 'testDb2']);
            }, function (err) {
              console.log(err);              
            });
          var throwaway = promise.should.be.fullfilled;
          
        });
    });
  });
  
  describe("mapper tests:", function () {
    var db;
        
    before(function (done) {
      Polyhedron.config.setQ(Q);
      db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.then(function (data) {
        db = data;
        done();
      },
      function (err) {
        done();
      });  
    });

    after(function (done) {
      testUtils.cleanupTestDatabases();
      done();
    }); 
           
    it('should create a named mapper given a model', function () { 
      var Foos = db.register('Foos', helper.FooModel);
      var throwaway = Foos.should.be.fullfilled;
    }); 

    it('should return existing mapper if model prototype is registered again', function () { 
      var Foos1 = db.register('Foos', helper.FooModel);
      var Foos2 = db.register('Foos', helper.FooModel);
      Foos1.should.equal(Foos2);
    });
    
    it('should raise an error if registered is cheanged', function () { 
      var Foos1 = db.register('Foos', helper.FooModel);
      try {
        db.register('Foos', helper.BarModel);
      } catch (variable) {
        variable.should.be.an.instanceOf(TypeError);
      } 
    });
    
    it('should return list of registered prototypes', function () { 
      var Foos1 = db.register('Foos', helper.FooModel);
      var Foos2 = db.register('Bars', helper.FooModel);
      var list = db.registered();
      list.should.have.members(['Foos', 'Bars']);
    });
    
    it('should delete a named mapper', function () { 
      var Foos1 = db.register('Foos', helper.FooModel);
      var Foos2 = db.register('Bars', helper.FooModel);
      db.deregister('Bars');
      var list = db.registered();
      list.should.have.members(['Foos']);
    });
    // it('', function () { });    
    
  });
  
  describe("model save tests:", function () {
    var db;
      
    before(function (done) {
      Polyhedron.config.setQ(Q);
      db = new Polyhedron.Datastore(PouchDB, 'testDb');
      db.then(function (data) {
        db = data;
        done();
      },
      function (err) {
        done();
      });  
    });

    after(function (done) {
      testUtils.cleanupTestDatabases();
      done();
    }); 
           
    // var Users = db.doctype('Users');
    // 
    // newUser = Users.create({name: 'Ryan'});
    // newUser._id // Some id set by /pouchDB/mongo
    it('should create a new unsaved instance', function () { 
      var Foos = db.register('Foos', helper.FooModel);
      var foo = Foos.new();
    }); 
    
      // define test models in helper  
      // beforeEach(){} 
      // var Users = db.doctype('Users',helper.FooModel);
      // 
    it('should create a new saved instance'); 
    it('should add a non-enumerable property with internal tracking values');
      // var Users = db.doctype('Users');
      // 
      // newUser = Users.new({name: 'Ryan'});
      // newUser._id // Undefined
    it('should retain behavior after object is saved and restored');
    it('should restore model data recursively including array and object properties');
    it('should return an error on missing or undefined object');
    it('should return an error if passed object of wrong type');
  });
  
  describe("model primary key tests:", function () {
    // it('', function () { 
    // });    
    it('should respect unique primary key declaration');
    it('should not save a new object with a duplicate primary key');
    it('should save an object with a duplicate primary key if model differs');
    
  });
  
  describe("util functions:", function () {
    it('should have a toJson method that excludes internal properties');
    it('should report saved=true status if saved');
    it('saved should become false if object is "dirty"');
    it('should report saved=false status if not saved');
  });
  
  // users = Users.find({}, {sort: ['createdAt', -1], limit: 10});
  // mattCount = User.count({name: 'Matthew'});
  // mattCount == 1; // true
  
});
