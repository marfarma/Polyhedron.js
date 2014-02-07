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
  
  var insertObjs = function() {
      var type = "FooModel";
      var type2 = "BarModel";
      var names = [];
      names.push("Mary Jane");
      names.push("Billy Bob");
      names.push("Peggy Sue");
      names.push("Bobby Joe");

      var promises = [];
      for(var i = 0; i < names.length; i++) {
          promises.push(saveNew(type, names[i]));
          if (i == 0){              
              promises.push(saveNew(type2, "Mary Sue"));
          }
      }  
  
      return promises;
  }     
  
  

  describe('update expectations', function() {

    it('should update an object and then get it back', function() {
        var findObj, savedObj, updObj;
        var findErrObj, saveErrObj;
        
        var done = function() {
            if ( (typeof findObj !== 'undefined') || (typeof findErrObj !== 'undefined' )) 
            {
                return true; 
            } else {
                return false;
            }
        };

        var results = $q.all(insertObjs())
            .then(function(data){
                updObj = data[0];
                updObj.name = "Billy Joe";
                return (
                    PouchModel.saveObj(updObj)
                      .then(function(data){
                                savedObj = data;
                                PouchModel.getById(updObj.apm_type, updObj._id)
                                .then(function(data){
                                            findObj = data;
                                        },
                                        function(err){
                                            findErrObj = reason;
                                        }
                                );
                            },
                            function(reason){
                                  saveErrObj = reason;
                            }
                      )
                );
            });

        $rootScope.$apply();
        waitsFor(function() {
            return done();
        }, "should update an object and then get it back test never completed.", 10000);

        runs(function () {
            expect(saveErrObj).not.toBeDefined();
            expect(findErrObj).not.toBeDefined();
            expect(findObj).toBeDefined();
            expect(findObj.name).toEqual(updObj.name);
            expect(findObj._id).toEqual(updObj._id);
            expect(findObj._rev).not.toEqual(updObj._rev);

        });
    });
    it('should not update an object to a duplicate name', function() {
        var findObj, savedObj, updObj;
        var findErrObj, saveErrObj;
        
        var done = function() {
            if ( (typeof savedObj !== 'undefined') || (typeof saveErrObj !== 'undefined' )) 
            {
                return true; 
            } else {
                return false;
            }
        };

        var results = $q.all(insertObjs())
            .then(function(data){
                updObj = data[0];                
                updObj.name = "Billy Bob";
                return (
                    PouchModel.saveObj(updObj)
                      .then(function(data){
                                savedObj = data;
                            },
                            function(reason){
                                  saveErrObj = reason;
                            }
                      )
                );
            });

        $rootScope.$apply();
        waitsFor(function() {
            return done();
        }, "should not update an object to a duplicate name test never completed.", 10000);

        runs(function () {
            expect(saveErrObj).toBeDefined();
            expect(findErrObj).not.toBeDefined();
            expect(findObj).not.toBeDefined();
        });
    });
    it('should update an object name to a duplicate name if types differ', function () {
        var findObj, savedObj, updObj;
        var findErrObj, saveErrObj;
        
        var done = function() {
            if ( (typeof savedObj !== 'undefined') || (typeof saveErrObj !== 'undefined' )) 
            {
                return true; 
            } else {
                return false;
            }
        };

        var results = $q.all(insertObjs())
            .then(function(data){
                updObj = data[0];
                updObj.name = "Mary Sue";
                return (
                    PouchModel.saveObj(updObj)
                      .then(function(data){
                                savedObj = data;
                            },
                            function(reason){
                                  saveErrObj = reason;
                            }
                      )
                );
            });

        $rootScope.$apply();
        waitsFor(function() {
            return done();
        }, "should update an object name to a duplicate name if types differ test never completed.", 10000);

        runs(function () {
            expect(saveErrObj).not.toBeDefined();
            expect(savedObj).toBeDefined();
            expect(savedObj.name).toEqual(updObj.name);
            expect(savedObj._id).toEqual(updObj._id);
            expect(savedObj._rev).not.toEqual(updObj._rev);
        });
    });
    it('should return an error if type property is changed', function() {
        var findObj, savedObj, updObj;
        var findErrObj, saveErrObj;
        
        var done = function() {
            if ( (typeof savedObj !== 'undefined') || (typeof saveErrObj !== 'undefined' )) 
            {
                return true; 
            } else {
                return false;
            }
        };

        var results = $q.all(insertObjs())
            .then(function(data){
                updObj = data[0];  
                updObj.name = "Mary Sue";
                updObj.apm_type = "ComplexModel";
                return (
                    PouchModel.saveObj(updObj)
                      .then(function(data){
                                savedObj = data;
                            },
                            function(reason){
                                  saveErrObj = reason;
                            }
                      )
                );
            });

        $rootScope.$apply();
        waitsFor(function() {
            return done();
        }, "should return an error if type property is changed test never completed.", 10000);

        runs(function () {
            expect(saveErrObj).toBeDefined();
            expect(savedObj).not.toBeDefined();
        });
    });
    it('should return an error if name and type are not typeof string', function() {
        var savedObj, updObj;
        var saveErrObj;
        
        var done = function() {
            if ( (typeof savedObj !== 'undefined') || (typeof saveErrObj !== 'undefined' )) 
            {
                return true; 
            } else {
                return false;
            }
        };

        var results = $q.all(insertObjs())
            .then(function(data){
                updObj = data[0];
                
                updObj.name = {};
                updObj.apm_type = {};
                return (
                    PouchModel.saveObj(updObj)
                      .then(function(data){
                                savedObj = data;
                            },
                            function(reason){
                                  saveErrObj = reason;
                            }
                      )
                );
            });

        $rootScope.$apply();
        waitsFor(function() {
            return done();
        }, "should return an error if name and type are not typeof string test never completed.", 10000);

        runs(function () {
            expect(savedObj).not.toBeDefined();
            expect(saveErrObj).toBeDefined();
            expect(saveErrObj.name[0]).toEqual("Name can't be blank");
        });
    });
  
  });

});