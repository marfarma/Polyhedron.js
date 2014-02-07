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
  //       this.apm_type = 'ComplexModel';
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
  
  // 

  
  describe('find expectations', function() {
      var names = [];
      names.push("Mary Jane");
      names.push("Billy Bob");
      names.push("Peggy Sue");
      names.push("Bobby Joe");

      var type = "FooModel";
      var type2 = "BarModel";
      
      
      it('should get all of a single type', function () {
          var results, results2;
          //var deferred = $q.defer();
      
          var done = function() {
              if (((typeof results !== 'undefined' && typeof results.then === 'undefined')
                  || typeof getAllErrObj !== 'undefined' ) 
                  && ((typeof results2 !== 'undefined'  && typeof results2.then === 'undefined')
                  || typeof getAllErrObj2 !== 'undefined')) {
                  return true; 
              } else {
                  return false;
              }
          };
          
          var promises = [];
      
          promises = [];     
          for(var i = 0; i < names.length; i++) {
              promises.push(saveNew(type, names[i]));
              promises.push(saveNew(type2, names[i]));
          }       
          var getAllErrObj, getAllErrObj2;
          results = $q.all(promises)
              .then(function(data){
                  return (PouchModel.getAll(type)
                      .then(function(data){
                              results = data;
                            }, 
                            function(reason){
                                getAllErrObj = reason;
                            })
                  );
              });
      
          results2 = $q.all(promises)
              .then(function(data){
                  return (PouchModel.getAll(type2)
                      .then(function(data){
                              results2 = data;
                            }, 
                            function(reason){
                                getAllErrObj2 = reason;
                            })
                  );
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "Save test never completed.", 10000);

          runs(function () {
              //console.log(results);
              expect(getAllErrObj).not.toBeDefined();
              expect(getAllErrObj2).not.toBeDefined();

              expect(results.length).toBe(4);
              expect(results[0].apm_type).toBe(type);
              expect(results[1].apm_type).toBe(type);
              expect(results[2].apm_type).toBe(type);
              expect(results[3].apm_type).toBe(type);

              expect(results2.length).toBe(4);
              expect(results2[0].apm_type).toBe(type2);
              expect(results2[1].apm_type).toBe(type2);
              expect(results2[2].apm_type).toBe(type2);
              expect(results2[3].apm_type).toBe(type2);
          });
      });

      it('should find an object by id', function () {
          var id, name, foundObj, findErrObj;
          var deferred = $q.defer();
          var type = "FooModel";
      
          var done = function() {
              if ((typeof foundObj !== 'undefined' && typeof foundObj.then === 'undefined')
                  || typeof findErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          saveNew(type, names[0])
                      .then(function(data){
                          id = data._id;
                          name = data.name;
                          return(PouchModel.getById(type, id));
                      },function(reason){
                          return $q.reject(reason);
                      })
                      .then( function(data){
                          //console.log(data);
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                      }); 
                      

              $rootScope.$apply();
              waitsFor(function() {
                  
                  return done();
              }, "should find an object by id test never completed.", 10000);

              runs(function () {
                  expect(findErrObj).not.toBeDefined();
                  expect(id).toBeDefined();
                  expect(name).toBeDefined();
                  expect(foundObj).toBeDefined();
                  expect(foundObj.name).toEqual(name);
                  expect(foundObj._id).toEqual(id);
                  expect(foundObj.apm_type).toEqual(type);
                  expect(angular.isFunction(foundObj.someFunc)).toBe(true);                    
              });
      });
      it('should find an object by name and type', function () {
          var id, name, foundObj, findErrObj;
          var deferred = $q.defer();
          var type = "FooModel";
      
          var done = function() {
              if (foundObj === null
                  || (typeof foundObj !== 'undefined' && typeof foundObj.then === 'undefined')
                  || typeof findErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          saveNew(type, names[0])
                      .then(function(data){
                          id = data._id;
                          name = data.name;
                          return(PouchModel.getByProperty(type, "name", name));
                      },function(reason){
                          return $q.reject(reason);
                      })
                      .then( function(data){
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                      });                      

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "should find an object by name and type test never completed.", 10000);

          runs(function () {
              expect(findErrObj).not.toBeDefined();
              expect(id).toBeDefined();
              expect(name).toBeDefined();
              expect(foundObj).toBeDefined();
              expect(foundObj.name).toEqual(name);
              expect(foundObj._id).toEqual(id);
              expect(foundObj.apm_type).toEqual(type);
              expect(angular.isFunction(foundObj.someFunc)).toBe(true);                    
          });
      });
      it('should return null if object is not found', function () {
          var foundObj, findErrObj;
          var type = "FooModel";
      
          var done = function() {
              if (foundObj === null
                  || (typeof foundObj !== 'undefined' && typeof foundObj.then === 'undefined')
                  || typeof findErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          PouchModel.getById(type,"XXX")
                      .then( function(data){
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                          //console.log(reason);
                      });                      

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "should return null if object is not found test never completed.", 10000);

          runs(function () {
              expect(findErrObj).not.toBeDefined();
              expect(foundObj).toEqual(null);
          });
      });
      it('should return an error if find by id not passed type or id', function () {
          var id, name, foundObj, findErrObj;
          var type = "FooModel";
      
          var done = function() {
              if (foundObj === null
                  || (typeof foundObj !== 'undefined' && typeof foundObj.then === 'undefined')
                  || typeof findErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          PouchModel.getById(type)
                      .then( function(data){
                          foundObj= data; 
                      },function(reason){
                          findErrObj = reason; 
                          //console.log(reason);
                      });                      

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "should find an object by id, id missing, test never completed.", 10000);

          runs(function () {
              expect(findErrObj).toBeDefined();
              expect(foundObj).not.toBeDefined();
              expect(findErrObj._id[0]).toEqual("_id can't be blank");
          });
      });
      it('should return an error if find by name not passed type or name', function () {
          var id, name, foundObj, findErrObj;
          var type = "FooModel";
      
          var done = function() {
              if ((typeof foundObj !== 'undefined' && typeof foundObj.then === 'undefined')
                  || typeof findErrObj !== 'undefined') {
                  return true; 
              } else {
                  return false;
              }
          };
          
          PouchModel.getByProperty(type)
                      .then( function(data){
                          foundObj= data; 
                      },function(reason){
                          //console.log(reason);
                          findErrObj = reason; 
                      });                      

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "should find an object by name test, name missing, never completed.", 10000);

          runs(function () {
              expect(findErrObj).toBeDefined();
              expect(foundObj).not.toBeDefined();
              expect(findErrObj.property[0]).toEqual("Property can't be blank");
          });
      });
      xit('YNGNI: should find an object by id and revision', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.rev: Fetch specific revision of a document. Defaults to winning revision (see couchdb guide.
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should find an object by id and return all revisions', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.revs: Include revision history of the document
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should find an object by id and include revision info', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.revs_info: Include a list of revisions of the document, and their availability.
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should find an object by id and include open revisions', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.open_revs: Fetch all leaf revisions if openrevs="all" or fetch all leaf revisions specified in openrevs array. Leaves will be returned in the same order as specified in input array
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should find an object by id and include conflicting revisions', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.conflicts: If specified conflicting leaf revisions will be attached in _conflicts array
          //expect("pending").toBe(false);
      });
      xit('YNGNI: should find an object by id and include local sequence', function () {
          // db.get(docid, [options], [callback])
          // Retrieves a document, specified by docid.

          // options.revs_info: Include a list of revisions of the document, and their availability.
          //expect("pending").toBe(false);
      });
      it('should return objects selected by google query language', function () {
          var results, getAllErrObj;
          //var deferred = $q.defer();
      
          var done = function() {
              if ((typeof results !== 'undefined' && typeof results.then === 'undefined')
                  || typeof getAllErrObj !== 'undefined' )  {
                  return true; 
              } else {
                  return false;
              }
          };
          
          var promises = [];
      
          promises = [];     
          for(var i = 0; i < names.length; i++) {
              promises.push(saveNew(type, names[i]));
              promises.push(saveNew(type2, names[i]));
          }       
          var getAllErrObj, getAllErrObj2;
          results = $q.all(promises)
              .then(function(data){
                  return (PouchModel.getByGql("type='FooModel' and name is not null")
                      .then(function(data){
                                 //console.log(data);
                                 results = data;
                             }, 
                             function(reason){
                                 getAllErrObj = reason;
                             })
                  );
              });

          $rootScope.$apply();
          waitsFor(function() {
              return done();
          }, "should return objects selected by google query language test never completed.", 10000);

          runs(function () {
              //console.log(results);
              expect(getAllErrObj).not.toBeDefined();
              expect(results).toBeDefined();
          });
          
      });

  
  });
  

});