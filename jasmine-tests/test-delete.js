describe("pouch-model", function() {
  // API
  var PouchModel, $q, $rootScope;
  var test = angular.module('test',[]);
  var testDB;
  var dbName = "testPouchModel";
  
  
  // Load required modules
  beforeEach(function(){
      angular.mock.module("pouch-model");
  });

  // Sub in testing database & get module under test
  beforeEach( function() {
      testDB = new PouchDB(dbName);
      waits(200);
      module(function ($provide) {
          $provide.value('$db', testDB);
      });
      
      // get PouchModel instance & simulate config 
      inject(function($injector) {
          PouchModel = $injector.get("PouchModel");
          PouchModel.setNew("FooModel", FooModel);
          PouchModel.setNew("BarModel", BarModel);
          PouchModel.setNew("ComplexModel", ComplexModel);
          waits(200);
      });

  });
  // drop the database after each test
  afterEach(function() {
     var done = false;
     runs(function(){
         PouchDB.destroy(dbName, function(err, info) {
             if (err) {
                    //.log("delete error", event);
                    done = true;
             } else { 
                    done = true;
             }
        });
         
         waitsFor(function() {
             return done;
         },5000);
     });
 });
 
 beforeEach(
    inject(function ( _$rootScope_, _$timeout_, _$q_, $db) {
        $rootScope = _$rootScope_;
        $timeout   = _$timeout_;
        $q         = _$q_;
    })
  );
  
  // var FooModel = function(){
  //     this.name     = '';
  //     this.apm_type     = 'FooModel';
  //     this.someFunc = function(){
  //         return "FooModel";
  //     };
  // };
  // 
  // var BarModel = function(){
  //     this.name = '';
  //     this.apm_type = 'FooModel';
  //     this.diffFunc = function(){
  //         return "BarModel";
  //     };
  // };
  // 
  // var ComplexModel = function() {
  //       this.name = '';
  //       this.fields = [];
  //       this.objProp = {prop1:"first",prop2:{location:"next"},prop3:["third1","third2","third3"]};
  //   
  //       this.deleteField = function(id) {
  //           this.fields.splice(id, 1);
  //           var newId = 1;
  //           angular.forEach(this.fields, function(field) {
  //               field.id = newId++;
  //           });
  //       };
  // 
  //       this.addField = function(value) {
  //         value = value || '';
  //         var id = this.fields.length + 1;
  //         this.fields.push({id:id, name:value});
  //       };
  //     
  //       this.addField('one');
  //       this.addField('two');
  //       this.addField('three');
  // };
  // 
  var saveNew = function(type, name){
      return PouchModel.newObj(type).then(   
              function(data){
                  data.name = name; return PouchModel.saveObj(data);
              }, 
              function(reason){
                  $q.reject(reason);
              }
          );
  };
  



  describe('delete expectations', function() {
      it('should delete an object by id', function () {
          var id, foundObj, findErrObj, deletedObj, saveErrObj, deleteErrObj;
          var deferred = $q.defer();
          var type = "FooModel";

          var done = function() {
              if (typeof findErrObj !== 'undefined' 
                  || typeof foundObj !== 'undefined' 
                  || typeof deletedObj !== 'undefined' 
                  || typeof deleteErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          saveNew(type, "Mary Jane")
                      .then(function(data){
                          id = data._id;
                          return(PouchModel.deleteById(id));
                      },function(reason){
                          saveErrObj= reason; 
                          return $q.reject(reason);
                      })
                      .then( function(data){ // delete promise resolve
                          //console.log(data);
                          deletedObj= data; 
                          return(PouchModel.getById(type, id));
                      },function(reason){
                          deleteErrObj = reason; 
                          return $q.reject(reason);
                      }) 
                      .then( function(data){ // find promise resolve
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                      });                     

              $rootScope.$apply();
              waitsFor(function() {  
                  return done();
              }, "should delete an object by id test never completed.", 10000);

              runs(function () {
                  expect(deleteErrObj).not.toBeDefined();
                  expect(foundObj).toEqual(null);
              });
      });
      it('should delete an object by object', function () {
          var id, foundObj, findErrObj, deletedObj, saveErrObj, deleteErrObj;
          var deferred = $q.defer();
          var type = "FooModel";

          var done = function() {
              if (typeof findErrObj !== 'undefined' 
                  || typeof foundObj !== 'undefined' 
                  || typeof deletedObj !== 'undefined' 
                  || typeof deleteErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          saveNew(type, "Mary Jane")
                      .then(function(data){
                          id = data._id;
                          return(PouchModel.deleteObj(data));
                      },function(reason){
                          saveErrObj= reason; 
                          return $q.reject(reason);
                      })
                      .then( function(data){ // delete promise resolve
                          deletedObj= data; 
                          return(PouchModel.getById(type, id));
                      },function(reason){
                          deleteErrObj = reason; 
                          return $q.reject(reason);
                      }) 
                      .then( function(data){ // find promise resolve
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                      });                     

              $rootScope.$apply();
              waitsFor(function() {  
                  return done();
              }, "should delete an object by obj test never completed.", 10000);

              runs(function () {
                  expect(deleteErrObj).not.toBeDefined();
                  expect(foundObj).toEqual(null);
              });
      });
      it('should return an error on delete by id if object does not exist', function () {
          var id, deletedObj, deleteErrObj;
          
          var done = function() {
              if (typeof deletedObj !== 'undefined' 
                  || typeof deleteErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
                    
          PouchModel.deleteById("1")
          .then( function(data){ // delete promise resolve
              deletedObj= data; 
          },function(reason){
              deleteErrObj = reason; 
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error on delete by id if object does not exist test never completed.", 10000);

          runs(function () {
              // { status : 404, error : 'not_found', reason : 'missing' }
              expect(deleteErrObj).toBeDefined();
              expect(deleteErrObj.status).toEqual(404);
              expect(deletedObj).toEqual(null);
          });
      });
      it('should return an error on delete if object does not exist', function () {
          var data, deletedObj, deleteErrObj;
          data = {"type":"FooModel","_id":"1","_rev":"2-aa01552213fafa022e6167113ed01087"};
          
          var done = function() {
              if (typeof deletedObj !== 'undefined' 
                  || typeof deleteErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          PouchModel.deleteObj(data)
          .then( function(data){ // delete promise resolve
              deletedObj= data; 
          },function(reason){
              deleteErrObj = reason; 
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error on delete if object does not exist test never completed.", 10000);

          runs(function () {
              // { status : 404, error : 'not_found', reason : 'missing' }
              expect(deleteErrObj).toBeDefined();
              expect(deleteErrObj.status).toEqual(404);
              expect(deletedObj).toEqual(null);
          });
      });
      it('should return an error on delete by id if id is undefined', function () {
          var firstObj, firstErrObj, id;    
          
          var done = function() {
              if (typeof firstObj !== 'undefined' 
                  || typeof firstErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          PouchModel.deleteById(id).then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error on delete if object does not exist test never completed.", 10000);

          runs(function () {
              expect(firstObj).not.toBeDefined();
              expect(firstErrObj).toBeDefined();
          });
      });
      it('should return an error on delete if object is undefined', function () {
          var firstObj, firstErrObj, data;    
          
          var done = function() {
              if (typeof firstObj !== 'undefined' 
                  || typeof firstErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          PouchModel.deleteObj(data)
          .then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error on delete if object does not exist test never completed.", 10000);

          runs(function () {
              expect(firstObj).not.toBeDefined();
              expect(firstErrObj).toBeDefined();
          });
      });
      it('should return an error on delete if object is missing an id', function () {
          var firstObj, firstErrObj, data = {};    
          
          var done = function() {
              if (typeof firstObj !== 'undefined' 
                  || typeof firstErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          PouchModel.deleteObj(data)
          .then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error on delete if object does not exist test never completed.", 10000);

          runs(function () {
              expect(firstObj).not.toBeDefined();
              expect(firstErrObj).toBeDefined();
          });
      });
  });

 

});