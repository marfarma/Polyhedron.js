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
  // var saveNew = function(type, name){
  //     return PouchModel.newObj(type).then(   
  //             function(data){
  //                 data.name = name; return PouchModel.saveObj(data);
  //             }, 
  //             function(reason){
  //                 $q.reject(reason);
  //             }
  //         );
  // };
  //   


  describe('prototype expectations', function() {
      
      it('should take object prototypes and return correct objects', function () {
          var firstObj, secondObj, firstErrObj, secondErrObj;    

          PouchModel.newObj("FooModel").then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });
          PouchModel.newObj("BarModel").then( function (myObj) 
          {
              secondObj = myObj;
          }, function(reason){
              secondErrObj = reason;
          });

          $rootScope.$apply();
          $timeout.flush();

          expect(angular.isFunction(firstObj.someFunc)).toBe(true);
          expect(angular.isFunction(secondObj.diffFunc)).toBe(true);
          expect(firstErrObj).not.toBeDefined();
          expect(secondErrObj).not.toBeDefined();
      });

      it('should return an error when attempting to create an object if type is not configured', function () {
          var firstObj, firstErrObj;    
          PouchModel.newObj("XXXModel").then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          $timeout.flush();

          expect(firstObj).not.toBeDefined();
          expect(firstErrObj).toBeDefined();
      });
      it('should return an error when attempting to find an object if type is not configured', function () {
          var firstObj, firstErrObj;    
          PouchModel.getById("XXXModel","1").then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          $timeout.flush();

          expect(firstObj).not.toBeDefined();
          expect(firstErrObj).toBeDefined();
      });
      it('should return an error when attempting to get all if type is not configured', function () {
          var firstObj, firstErrObj;    
          PouchModel.getAll("XXXModel").then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          $timeout.flush();

          expect(firstObj).not.toBeDefined();
          expect(firstErrObj).toBeDefined();
      });
      it('should return an error when attempting to save objects if type is not configured', function () {
          var firstObj, firstErrObj;   
          var newObj = {"name":"Mary Jane","type":"XXXModel","_id":"","_rev":""}; 
          
          PouchModel.saveObj(newObj).then( function (myObj) 
          {
              firstObj = myObj;
          }, function(reason){
              firstErrObj = reason;
          });

          $rootScope.$apply();
          $timeout.flush();

          expect(firstObj).not.toBeDefined();
          expect(firstErrObj).toBeDefined();
      });
      it('should return an error when calling setNew() with a value that is not a function', function () {
          expect(PouchModel.setNew("FooModel", 1)).toBeDefined();
          expect(PouchModel.setNew("FooModel", FooModel)).not.toBeDefined();
      });
  });  

});