"use strict";

var util = require('./util.js');
var PouchDB = require('pouchdb');
// var Promise;
var Promise = require('bluebird');
// Configure
Promise.config({
    longStackTraces: true,
    warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
});

require('pouchdb-all-dbs')(PouchDB);
// Generate a v4 UUID (random)
var uuidV4 = require('uuid/v4');

var Polyhedron = exports;

Polyhedron.config = {};
Polyhedron.config.Q = function () {};

// TODO: polyfill bluebird so it will work
Polyhedron.config.setQ = function (q) {
  Polyhedron.config.Q = q || {};
  // Promise = Polyhedron.config.Q;
};

function Datastore(database, options) {
  this.models = {};
  this.options = options || {};

  if (typeof database !== 'string') {
    throw new TypeError('Database must be a string.');
  }
  this.database = database;
  this.db = new PouchDB(database, options);
  return this;
}

Datastore.prototype.destroy = function () {
  return this.db.destroy().then(
    function(){
      return undefined;
    }.bind(this)
  );
};

Datastore.prototype.register = function (type, func) {
  if (typeof this.models[type] !== 'undefined') {
    if (this.models[type].Proto !== func) {
      throw new TypeError('Previously registered models cannot be modified.');
    }
  } else {
    if (typeof func !== 'function') {
      throw new TypeError('Parameter "func" is not a function.');
    } else {
      this.models[type] = new Mapper({"proto": func,
                          "name": type,
                          "datastore": this.db});
      // console.log('register type: ', this.models[type]);
    }
  }
  return this.models[type];
};

Datastore.prototype.registered = function () {
  return Object.keys(this.models);
};

Datastore.prototype.deregister = function (type) {
  if (typeof this.models[type] !== 'undefined') {
    delete this.models[type];
  }
};

function Mapper(args) {
  this.Proto = args.proto;
  this.name = args.name;
  this.datastore = args.datastore;

  var toSerializable = function(obj) {
    // copy data to savable object
    var serializableObj = {};
    for (var field in obj) {
        if (obj.hasOwnProperty(field)) {
            if (typeof obj[field] !== 'function') {
                serializableObj[field] = util.copy(obj[field]);
            }
        }
    }
    return serializableObj;
  };

  return this;
}

Mapper.prototype.save = function (item) {
  return Promise.resolve(item);
};

Mapper.prototype.new = Promise.method(function () {
  return new this.Proto();
});

Mapper.prototype.create = function () {
  var newObj;

  return this.new()
  .then(function(item){
    item._id = uuidV4(); // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    newObj = item;
    var safeObj = util.fromJson(util.toJson(item));
    return this.datastore.put(safeObj);
  }.bind(this))
  .then(function(res){
    newObj._rev = res.rev;
    newObj._id = res.id;
    return Promise.resolve(newObj);
  })
  .catch(function(err){
    return Promise.reject(new Error(err));
  });

};

Polyhedron.Datastore = Datastore;
