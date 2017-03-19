"use strict";

var chai = require('chai'),
   Q = global.Promise || require('bluebird'),
   Promise = Q,
   expect = chai.expect,
   should = chai.should(),
   chaiAsPromised = require('chai-as-promised'),
   Polyhedron = require('../polyhedron.js'),
   helper = require('./helper.js'),
   exec = require('child_process').exec,
   testUtils = require('./utils.js');

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
      expect(typeof Polyhedron).to.equal('object');
      return  Polyhedron.should.be.defined;
      });

    it("create database should return a promise", function () {
      var db = new Polyhedron.Datastore('testDb');
      return db.should.be.fullfilled;
    });

    it("should create a database", function () {
      var db = new Polyhedron.Datastore('testDb');
      return db.should.be.an.instanceof(Polyhedron.Datastore);
    });

    it("should create another database", function () {
      var db, db2;
      db = new Polyhedron.Datastore('testDb');
      db2 = new Polyhedron.Datastore('testDb2');
      return db2.should.have.property('database').that.is.not.equal(db.database);
    });

    it('should delete a database', function () {
      return new Polyhedron.Datastore('testDb').destroy()
        .then(function(db){
          return should.equal(db, undefined);
        });
    });
  });

  describe("mapper tests:", function () {
    var db;

    before(function () {
      db = new Polyhedron.Datastore('testDb');
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

    before(function () {
      db = new Polyhedron.Datastore('testDb');
    });

    after(function (done) {
      testUtils.cleanupTestDatabases();
      done();
    });

    it('should create a new unsaved instance', function () {
      var Foos = db.register('Foos', helper.FooModel);
      return Foos.new().should.eventually.not.have.property("_rev");
    });

    it('should create a new saved instance', function () {
      var Foos = db.register('Foos', helper.FooModel);
      var foo = Foos.create().then(function(result){
        return Promise.resolve(result);
      })
      .catch(function(err){
        console.log('testCase: err creating foo: ', err);
      });
      return foo.should.eventually.have.property("_rev");
    });

    it('should add a non-enumerable property with internal tracking values', function () {
      return should.fail();
    });
    it.skip('should retain behavior after object is saved and restored');
    it.skip('should restore model data recursively including array and object properties');
    it.skip('should return an error on missing or undefined object');
    it.skip('should return an error if passed object of wrong type');
  });

  describe.skip("model primary key tests:", function () {
    it('should respect unique primary key declaration');
    it('should not save a new object with a duplicate primary key');
    it('should save an object with a duplicate primary key if model differs');
  });

  describe.skip("util functions:", function () {
    it('should have a toJson method that excludes internal properties');
    it('should report saved=true status if saved');
    it('saved should become false if object is "dirty"');
    it('should report saved=false status if not saved');
  });


  // users = Users.find({}, {sort: ['createdAt', -1], limit: 10});
  // mattCount = User.count({name: 'Matthew'});
  // mattCount == 1; // true

});
