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
  
  describe('validation expectations', function() {
      it('should validate pouch_model_validations if present', function () {
          var newObj,savedObj, foundObj, newErrObj, saveErrObj, findErrObj;

          newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"","apm_validations": {
          name: {presence: true, simple: true, unique: {}} } };

          var done = function() {
              if (typeof saveErrObj !== 'undefined' || typeof foundObj !== 'undefined' || typeof findErrObj !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };
      
          PouchModel.saveObj(newObj) 
              .then( function(myObj){
                  savedObj = myObj;
                  PouchModel.getById("FooModel", savedObj._id)
                    .then( function(myObj){
                      foundObj = myObj; 
                  },function(reason){
                      findErrObj = reason; 
                  }); 
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "Save test never completed.", 10000);

          runs(function () {
              expect(newErrObj).not.toBeDefined();
              expect(saveErrObj).not.toBeDefined();
              expect(findErrObj).not.toBeDefined();
              expect(newObj).toBeDefined();
              expect(savedObj).toBeDefined();
              expect(foundObj).toBeDefined();
              expect(savedObj.name).toBe("Mary Jane");
              expect(savedObj._id).not.toBe('');
              expect(savedObj._rev).not.toBe('');
              expect(foundObj.name).toEqual(savedObj.name);
              expect(foundObj.apm_type).toEqual(savedObj.apm_type);
              expect(foundObj._id).toEqual(savedObj._id);
              expect(foundObj._rev).toEqual(savedObj._rev);
              expect(angular.isFunction(foundObj.someFunc)).toBe(true);                    
          });
      });
      
      it('should not return error when pouch_model_validations are not present', function () {
          var newObj,savedObj, foundObj, newErrObj, saveErrObj, findErrObj;

          newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":""};

          var done = function() {
              if (typeof saveErrObj !== 'undefined' || typeof savedObj !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };
      
          PouchModel.saveObj(newObj) 
              .then( function(myObj){
                  savedObj = myObj;
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "Save test never completed.", 10000);

          runs(function () {
              expect(saveErrObj).not.toBeDefined();
              expect(savedObj).toBeDefined();
          });
      });
      
      validate.validators.custom = function(value, options, key, attributes) {
        return "is totally wrong";
      };
      validate.validators.custom2 = function(value, options, key, attributes) {
        return "is absolutely wrong";
      };
      
      // unique : on: {property:property_name, type:type (defaults to current model's type)}
      it('should validate model for criteria unique on property', function () {
          var _done = false;
          var errors;
          var valid;
          
          newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"",
              "apm_validations": {
                  name: {presence: {}, unique: {}} 
              } 
          };
          
          validate.asyncValidate(newObj, newObj.apm_validations, {}, function(error,data){
                  _done = true;
                  if (error) {
                      errors = error;
                  } else {
                      valid = true;
                  }
              }
          );
          
          $rootScope.$apply();
          //$timeout.flush();
          waitsFor(function() {
              return _done;
          }, "validation chain test never completed.", 10000);
          
          runs(function () {
              expect(errors).not.toBeDefined();
              expect(valid).toEqual(true);
          });
      });
      
      // exists : (property: property, options: {type:foreign_type,property:foreign_property}) 
      it('should validate model for criteria exists on type and property (foreign key)', function () {
          var _done = false;
          var errors;
          var valid;
          
          var newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"",
              "apm_validations": {
                  BarModelId: {presence: {}, exists: {type:"BarModel",property:"_id"}} 
              } 
          };
          
          var barObj = {"name":"Mary Jane","apm_type":"BarModel","_id":"","_rev":"","apm_validations": {
          name: {presence: true, simple: true, unique: {}} } };

          PouchModel.saveObj(barObj) 
              .then( function(myObj){
                  savedObj = myObj;
                  newObj.BarModelId = myObj._id;
                  validate.asyncValidate(newObj, newObj.apm_validations, {}, function(error,data){
                          _done = true;
                          if (error) {
                              errors = error;
                          } else {
                              valid = true;
                          }
                      }
                  );
              },function(reason){
                  saveErrObj = reason; 
              });
          
          $rootScope.$apply();
          waitsFor(function() {
              return _done;
          }, "validation chain test never completed.", 10000);
          
          runs(function () {
              expect(errors).not.toBeDefined();
              expect(valid).toEqual(true);
          });
      });
      // exists : (property: property, options: {type:type, property:foreign_property}) 
      it('should return an error when not exists on type and property (foreign key)', function () {
          var _done = false;
          var errors;
          var valid;
          
          var newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"",
              "apm_validations": {
                  BarModelId: {presence: {}, exists: {type:"BarModel",property:"_id"}} 
              },
              "BarModelId":"BadId" 
          };
          
          validate.asyncValidate(newObj, newObj.apm_validations, {}, function(error,data){
                  _done = true;
                  if (error) {
                      errors = error;
                  } else {
                      valid = true;
                  }
              }
          );
          
          $rootScope.$apply();
          waitsFor(function() {
              return _done;
          }, "validation chain test never completed.", 10000);
          
          runs(function () {
              expect(errors).toBeDefined();
              expect(valid).not.toEqual(true);
          });
      });
      
      // omits : (property: property, options: {type:foreign_type,property:foreign_property}) 
      it('should return an error when exists omits record on type and property (foreign key)', function () {
          var _done = false;
          var errors;
          var valid;
          
          var newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"",
              "apm_validations": {
                  BarModelId: {presence: {}, omits: {type:"BarModel",property:"_id"}} 
              } 
          };
          
          var barObj = {"name":"Mary Jane","apm_type":"BarModel","_id":"","_rev":"","apm_validations": {
          name: {presence: true, simple: true, unique: {}} } };

          PouchModel.saveObj(barObj) 
              .then( function(myObj){
                  savedObj = myObj;
                  newObj.BarModelId = myObj._id;
                  validate.asyncValidate(newObj, newObj.apm_validations, {}, function(error,data){
                          _done = true;
                          if (error) {
                              errors = error;
                          } else {
                              valid = true;
                          }
                      }
                  );
              },function(reason){
                  saveErrObj = reason; 
              });
          
          $rootScope.$apply();
          waitsFor(function() {
              return _done;
          }, "validation chain test never completed.", 10000);
          
          runs(function () {
              expect(errors).toBeDefined();
              expect(valid).not.toEqual(true);
          });
      });
      // omits : (property: property, options: {type:type, property:foreign_property}) 
      it('should validate model omits record on type and property (foreign key)', function () {
          var _done = false;
          var errors;
          var valid;
          
          var newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"",
              "apm_validations": {
                  BarModelId: {presence: {}, omits: {type:"BarModel",property:"_id"}} 
              },
              "BarModelId":"BadId" 
          };
          
          validate.asyncValidate(newObj, newObj.apm_validations, {}, function(error,data){
                  _done = true;
                  if (error) {
                      errors = error;
                  } else {
                      valid = true;
                  }
              }
          );
          
          $rootScope.$apply();
          waitsFor(function() {
              return _done;
          }, "validation chain test never completed.", 10000);
          
          runs(function () {
              expect(errors).not.toBeDefined();
              expect(valid).toEqual(true);
          });
      });
      
      // unique : on: {property:property_name, within:collection}
      xit('PEND: should validate model for criteria unique on property within collection', function () {
      });
      
  });

});