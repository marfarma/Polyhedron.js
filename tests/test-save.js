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
  


  describe('save expectations', function() {
      it('should save an object and then get it back', function() { 
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
  
      it('should not save a new object with a duplicate name', function () {
          var done = function() {
              if (typeof savedObj2 !== 'undefined' || typeof saveErrObj2 !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };

          var savedObj,savedObj2, saveErrObj, saveErrObj2;

          newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"","apm_validations": {
          name: {presence: true, simple: true, unique: {}} } };

          PouchModel.saveObj(newObj) 
              .then( function(myObj){
                  savedObj = myObj;
                  PouchModel.saveObj(newObj) 
                      .then( function(myObj){
                          savedObj2 = myObj;
                      },function(reason){
                          saveErrObj2 = reason; 
                      });
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "'should not save a new object with a duplicate name' never completed.", 10000);

          runs(function () {
              expect(savedObj).toBeDefined();
              expect(savedObj2).not.toBeDefined();
              expect(saveErrObj2).toBeDefined();
              expect(saveErrObj2.name[0]).toEqual("Name is not unique");
          });
      });
      it('should save an object with a duplicate name if their type properties differ', function () {
          var done = function() {
              if (typeof savedObj2 !== 'undefined' || typeof saveErrObj2 !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };

          var savedObj,savedObj2, saveErrObj, saveErrObj2;

          newObj = {"name":"Mary Jane","apm_type":"FooModel","_id":"","_rev":"","apm_validations": {
          name: {presence: true, simple: true, unique: {}} } };
          

          PouchModel.saveObj(newObj) 
              .then( function(myObj){
                  savedObj = myObj;
                  newObj.apm_type = 'BarModel';
                  PouchModel.saveObj(newObj) 
                      .then( function(myObj){
                          savedObj2 = myObj;
                      },function(reason){
                          saveErrObj2 = reason; 
                      });
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "'should save a new object with a duplicate name but different type' never completed.", 10000);

          runs(function () {
              expect(savedObj).toBeDefined();
              expect(savedObj2).toBeDefined();
              expect(saveErrObj2).not.toBeDefined();
          });
      });
      it('should return an error if name and type are not typeof string', function () {
          var newObj, firstObj, firstErrObj, id;    
          
          var done = function() {
              if (typeof firstObj !== 'undefined' 
                  || typeof firstErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          newObj = {"name":{b:"Mary Jane"},"apm_type":{a:"FooModel"},"_id":"","_rev":"",
          "apm_validations": { name: {presence: true, simple: true, unique: {}} }
          };

          PouchModel.saveObj(newObj) 
          .then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          waitsFor(function() {  
              return done();
          }, "should return an error if name and type are not typeof string test never completed.", 10000);

          runs(function () {
              expect(firstObj).not.toBeDefined();
              expect(firstErrObj).toBeDefined();
              expect(firstErrObj.name).toBeDefined();
              expect(firstErrObj.apm_type).toBeDefined();
          });
      });
      it('should return an error if name and type are empty strings', function () {
          var newObj, firstObj, firstErrObj, id;    
          
          var done = function() {
              if (typeof firstObj !== 'undefined' 
                  || typeof firstErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };

          newObj = {"name":"","type":"","_id":"","_rev":"","apm_validations": {
                     name: {presence: true, simple: true, unique: {}} }
          };

          PouchModel.saveObj(newObj) 
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
              expect(firstErrObj.name).toBeDefined();
              expect(firstErrObj.apm_type).toBeDefined();
          });
      });
      it('should retain behavior after object is saved and restored from the pouchdb', function () {
          var newObj,savedObj, foundObj, newErrObj, saveErrObj, findErrObj;

          newObj = new ComplexModel();
          newObj.apm_type = "ComplexModel";
          newObj._id = '';
          newObj._rev = '';
          newObj.name = "Testing";
          

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
                  PouchModel.getById("ComplexModel", savedObj._id)
                    .then( function(myObj){
                      foundObj = myObj;
                      //console.log(myObj); 
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
              expect(savedObj.name).toBe("Testing");
              expect(savedObj._id).not.toBe('');
              expect(savedObj._rev).not.toBe('');
              expect(foundObj.name).toEqual(savedObj.name);
              expect(foundObj._id).toEqual(savedObj._id);
              expect(foundObj._rev).toEqual(savedObj._rev);
              expect(angular.isFunction(foundObj.addField)).toBe(true); 
              
              foundObj.addField("TestField");
              expect(foundObj.fields.length == 4);
              expect(foundObj.fields[3].name === "TestField");
                                 
          });
      });
      
      it('should restore model data recursively including array and object properties', function () {
          var newObj,savedObj, foundObj, newErrObj, saveErrObj, findErrObj;

          newObj = new ComplexModel();
          newObj.apm_type = "ComplexModel";
          newObj._id = '';
          newObj._rev = '';
          newObj.name = "Testing";
          

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
                  PouchModel.getById("ComplexModel", savedObj._id)
                    .then( function(myObj){
                      foundObj = myObj;
                      //console.log(myObj); 
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
              expect(savedObj.name).toBe("Testing");
              expect(savedObj._id).not.toBe('');
              expect(savedObj._rev).not.toBe('');
              expect(foundObj.name).toEqual(savedObj.name);
              expect(foundObj._id).toEqual(savedObj._id);
              expect(foundObj._rev).toEqual(savedObj._rev);
              expect(angular.isFunction(foundObj.addField)).toBe(true); 
              
              foundObj.addField("TestField");
              //        this.objProp = {prop1:"first",prop2:{location:"next"},prop3:["third1","third2","third3"]};
              expect(foundObj.objProp.prop1 === "first");
              expect(foundObj.objProp.prop2.location === "next");
              expect(foundObj.objProp.prop3.length === 3);
              expect(foundObj.objProp.prop3[1] === "third2");
          });
      });
      it('should return an error on missing name or type properties', function () {
          var done = function() {
              if (typeof savedObj !== 'undefined' || typeof saveErrObj !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };

          var savedObj, saveErrObj;

          newObj = {"type":"FooModel","_id":"","_rev":"","apm_validations": {
                     name: {presence: true, simple: true, unique: {}} }};

          PouchModel.saveObj(newObj) 
              .then( function(myObj){
                  savedObj = myObj;
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "'should return an error on missing name or type' never completed.", 10000);

          runs(function () {
              expect(savedObj).not.toBeDefined();
              expect(saveErrObj).toBeDefined();
              expect(saveErrObj.name[0]).toEqual("Name can't be blank");
          });
      });
      it('should return an error on missing undefined object', function () {
          var done = function() {
              if (typeof savedObj !== 'undefined' || typeof saveErrObj !== 'undefined' ) {
                  return true; 
              } else {
                  return false;
              }
          };

          var savedObj, saveErrObj;

          PouchModel.saveObj() 
              .then( function(myObj){
                  savedObj = myObj;
              },function(reason){
                  saveErrObj = reason; 
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "'should not save a new object with a duplicate name' never completed.", 10000);

          runs(function () {
              expect(savedObj).not.toBeDefined();
              expect(saveErrObj).toBeDefined();
              expect(saveErrObj.message).toEqual("saveObj - error object undefined");
          });
      });

      xit('YNGNI: should report conflicts on models retreived with find by id', function () {
          // "_conflicts":true
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should report conflicts on models retreived with getAll', function () {
          // "_conflicts":true
          //expect("pending").toBe(false);
      });

  });

});