var FooModel = function(){
    this.name     = '';
    this.apm_type     = 'FooModel';
    this.someFunc = function(){
        return "FooModel";
    };
    this.apm_validations = {
        name: {presence: true, simple: true, unique: {}} 
    };
};

var BarModel = function(){
    this.name = '';
    this.apm_type = 'FooModel';
    this.diffFunc = function(){
        return "BarModel";
    };
    this.apm_validations = {
        name: {presence: true, simple: true, unique: {}} 
    };
};

var ComplexModel = function() {
      this.name = '';
      this.apm_type = 'ComplexModel';
      this.apm_validations = {
          name: {presence: true, simple: true, unique: {}} 
      };
      this.fields = [];
      this.objProp = {prop1:"first",prop2:{location:"next"},prop3:["third1","third2","third3"]};
  
      this.deleteField = function(id) {
          this.fields.splice(id, 1);
          var newId = 1;
          angular.forEach(this.fields, function(field) {
              field.id = newId++;
          });
      };

      this.addField = function(value) {
        value = value || '';
        var id = this.fields.length + 1;
        this.fields.push({id:id, name:value});
      };
    
      this.addField('one');
      this.addField('two');
      this.addField('three');
};

// var saveNew = function(type, name){
//     return PouchModel.newObj(type).then(   
//             function(data){
//                 data.name = name; 
//                 return PouchModel.saveObj(data);
//             }, 
//             function(reason){
//                 $q.reject(reason);
//             }
//         );
// };

