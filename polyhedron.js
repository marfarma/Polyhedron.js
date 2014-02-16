"use strict";

var Polyhedron = exports;


Polyhedron.config = {};
Polyhedron.config.Q = function () {};


// TODO: polyfill bluebird so it will work
Polyhedron.config.setQ = function (q) { 
  Polyhedron.config.Q = q || {}; 
};

Polyhedron.servers = {};

function Datastores(server) {
  return Object.keys(Polyhedron.servers[server]);
}

// TODO: extract into server interface
function Datastore(server, database) {
  
  var db,
    deferred;
    
  this.models = {};
    
  if (Polyhedron.config.Q !== 'undefined') {  
    deferred = Polyhedron.config.Q.defer(); 
  
    if (typeof server !== 'object' && typeof server !== 'function') {
      deferred.reject(new TypeError('Server must be an object.'));
    }
    this.server = server;
    Polyhedron.servers[server] = Polyhedron.servers[server] || {};

    if (typeof database !== 'string') {
      deferred.reject(new TypeError('Database must be a string.'));
    }
    this.database = database;
    Polyhedron.servers[server][database] = 1;
    
    this.db = this.server(database);
    deferred.resolve(this);
    
    return deferred.promise;
  } else {
    throw new TypeError('Promise library not configured.');
  }
  
}

// TODO: extract into server interface
Datastore.prototype.destroy = function () {
  var deferred = Polyhedron.config.Q.defer(); 
  
  this.server.destroy(this.database, function (err, info) {
    if (err) {
      if (err instanceof Error) {
        deferred.reject(err);
      } else {
        deferred.reject(new Error(err));
      }
    } else {
      delete Polyhedron.servers[this.server][this.database];
      deferred.resolve(info);
    }
  });
  
  return deferred.promise;
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
                          "database": this.database,
                          "server": this.server,
                          "datastore": this});
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
  this.database = args.database;
  this.server = args.server;
  this.datastore = args.datastore;
}

Mapper.prototype.new = function () {
  var item = new this.Proto();
  return Polyhedron.config.Q.when(item);
};

// mapper properties use: __polyhedron__
// properties of interest: server, database, identity map id

Polyhedron.Datastore = Datastore;
Polyhedron.Datastores = Datastores;



//module.exports = Polyhedron;

// var Polyhedron.prototype.PolyhedronError = (function() {
//   function F(){}
//   function CustomError() {
//     var _this = (this===window) ? new F() : this, // correct if not called with "new" 
//       tmp = Error.prototype.constructor.apply(_this,arguments)
//     ;
//     for (var i in tmp) {
//       if (tmp.hasOwnProperty(i)) _this[i] = tmp[i];
//     }
//     return _this;
//   }
//   function SubClass(){}
//   SubClass.prototype = Error.prototype;
//   F.prototype = CustomError.prototype = new SubClass();
//   CustomError.prototype.constructor = CustomError;
//  
//   CustomError.prototype.Status = function(status){
//     if (status != null) this.status = status;
//     return this.status;
//   }
//     
//   CustomError.prototype.Code = function(code){
//     if (code != null) this.code = code;
//     return this.code;
//   }
//     
//   return CustomError;
// })();
// 
// Polyhedron.prototype.Errors = {
//   NOT_FOUND: function () {
//       var err = new PolyhedronError('Item was not found.');
//       err.Status(404);
//       err.Code('not_found');
//       return err;
//     }();
//   };
