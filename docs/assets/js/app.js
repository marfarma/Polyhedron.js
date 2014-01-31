'use strict';

//Adjust body and .anchortarget so that navbar doesn't cover up anchor
//http://stackoverflow.com/questions/20691063/jquery-set-height-of-variable-height-navbar-for-body-and-class-used-on-anchors-s
$(window).on('resize load', function() {
    $('body').css({
        "padding-top": $(".navbar").height() + "px"
    });

    $('.anchortarget').css({
        "padding-top": $(".navbar").height() + "px"
    }, {
        "margin-top": $(".navbar").height() - "px"
    });

});
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
;if("document" in self&&!("classList" in document.createElement("_"))){(function(j){"use strict";if(!("Element" in j)){return}var a="classList",f="prototype",m=j.Element[f],b=Object,k=String[f].trim||function(){return this.replace(/^\s+|\s+$/g,"")},c=Array[f].indexOf||function(q){var p=0,o=this.length;for(;p<o;p++){if(p in this&&this[p]===q){return p}}return -1},n=function(o,p){this.name=o;this.code=DOMException[o];this.message=p},g=function(p,o){if(o===""){throw new n("SYNTAX_ERR","An invalid or illegal string was specified")}if(/\s/.test(o)){throw new n("INVALID_CHARACTER_ERR","String contains an invalid character")}return c.call(p,o)},d=function(s){var r=k.call(s.getAttribute("class")||""),q=r?r.split(/\s+/):[],p=0,o=q.length;for(;p<o;p++){this.push(q[p])}this._updateClassName=function(){s.setAttribute("class",this.toString())}},e=d[f]=[],i=function(){return new d(this)};n[f]=Error[f];e.item=function(o){return this[o]||null};e.contains=function(o){o+="";return g(this,o)!==-1};e.add=function(){var s=arguments,r=0,p=s.length,q,o=false;do{q=s[r]+"";if(g(this,q)===-1){this.push(q);o=true}}while(++r<p);if(o){this._updateClassName()}};e.remove=function(){var t=arguments,s=0,p=t.length,r,o=false;do{r=t[s]+"";var q=g(this,r);if(q!==-1){this.splice(q,1);o=true}}while(++s<p);if(o){this._updateClassName()}};e.toggle=function(p,q){p+="";var o=this.contains(p),r=o?q!==true&&"remove":q!==false&&"add";if(r){this[r](p)}return !o};e.toString=function(){return this.join(" ")};if(b.defineProperty){var l={get:i,enumerable:true,configurable:true};try{b.defineProperty(m,a,l)}catch(h){if(h.number===-2146823252){l.enumerable=false;b.defineProperty(m,a,l)}}}else{if(b[f].__defineGetter__){m.__defineGetter__(a,i)}}}(self))};

/*
 * DOMParser HTML extension
 * 2012-09-04
 * 
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
	"use strict";

	var
	  DOMParser_proto = DOMParser.prototype
	, real_parseFromString = DOMParser_proto.parseFromString
	;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var
			  doc = document.implementation.createHTMLDocument("")
			;
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
}(DOMParser));

var getAllElementByXpath = function (dom, path) {
    return dom.evaluate(path, dom, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
};
var getElementByXpath = function (dom, path) {
    return dom.evaluate(path, dom, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};
angular.module('scrollto', []);

angular.module("ngScrollTo",[])
  .directive("scrollTo", ["$window", function($window){
    return {
      restrict : "AC",
      compile : function(){

        var document = $window.document;

        function scrollInto(idOrName) {
            //find element with the give id of name and scroll to the first element it finds
          if(!idOrName)
            $window.scrollTo(0, 0);
          //check if an element can be found with id attribute
          var el = document.getElementById(idOrName);
          if(!el) {//check if an element can be found with name attribute if there is no such id
            el = document.getElementsByName(idOrName);

            if(el && el.length)
              el = el[0];
            else
              el = null;
          }

          if(el) //if an element is found, scroll to the element
            el.scrollIntoView();
          //otherwise, ignore
        }

        return function(scope, element, attr) {
          element.bind("click", function(event){
            scrollInto(attr.scrollTo);
          });
        };
      }
    };
  }]);
 
var myApp = angular.module('myApp', ['ui.bootstrap','ngScrollTo']).
directive('navbar', ['$location', '$http',  function ($location, $http) {
    return {
        restrict: 'E',
        transclude: true,
        scope: { heading: '@'},
        controller: 'NavbarCtrl',
        templateUrl: 'navbar.html',
        replace: true,
        link: function ($scope, $element, $attrs, navbarCtrl) {
            
            var items = $scope.items = [];
            $scope.name = $scope.name || $attrs.name;
            $scope.user = $scope.user || $attrs.user;
            $scope.heading = $scope.heading || $attrs.heading;
            
            var itemsXpath = '//*[@id="global"]/div/div';
            var itemsUrl = 'http://'+ $scope.user + '.viewdocs.io/' + $scope.name + '/nav';
            $http.get(itemsUrl).success(function(data) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "text/html");

                $scope.items = angular.fromJson(getElementByXpath(doc,itemsXpath).innerText);
                navbarCtrl.selectByUrl($location.absUrl());
            });
            
            $scope.$watch('$location.absUrl()', function (locationPath) {
                navbarCtrl.selectByUrl(locationPath)
            });
        }
    }
}]).
directive('sidebarNav', function($compile) {
  return {
    restrict: 'A',
    controller: 'SidebarnavCtrl',
    link: function ($scope, element) {
        
        var index = 1;
        $scope.items = [];
        var  itemsXpath = '//*[@id="global"]/div/h2 | //*[@id="global"]/div/table/tbody/tr/td[1]/div';  
        var headers = getAllElementByXpath(document,itemsXpath);
        
        
        for ( var i=0 ; i < headers.snapshotLength; i++ )
        {
          var header =  headers.snapshotItem(i);
          // add id to each section header element
          header.id = "section" + index++;
          // collect details for sidebar nav (ngRepeat in html)
          var item = new Object();
          item.id = header.id;
          item.text = header.innerText;
          $scope.items.push(item);
          
          // add "top" link to each element
          header.innerHTML = header.innerHTML+' <small><a scroll-to=""> (top)</a></small>';
        }
                
        // angular.forEach(headers, function (header) {
        //     // add id to each section header element
        //     header.id = "section" + index++;
        //     // collect details for sidebar nav (ngRepeat in html)
        //     var item = new Object();
        //     item.id = header.id;
        //     item.text = header.innerText;
        //     $scope.items.push(item);
        //     
        //     // add "top" link to each element
        //     header.innerHTML = header.innerHTML+' <small><a scroll-to=""> (top)</a></small>';
        // });
        $compile(element.contents())($scope);
    }
  };
}).
directive('pageHeading', function($compile) {
  return {
    restrict: 'A',
    link: function ($scope, element) {

        var header = angular.element(document.querySelector('#global h1:first-of-type')); 
        var paragraph = angular.element(document.querySelector('#global p:first-of-type'));

        // copy elements & add to heading
        element.append(header);
        element.append(paragraph);
        
    }
  };
}).
directive('addClasses', function($compile) {
  return {
    restrict: 'A',
    link: function ($scope, element) {
        // `bootstapify` tables in content area
        var tables = document.querySelectorAll('table');
        angular.forEach(tables, function (table) {
            table.classList.add("table");
            table.classList.add("table-background");
            table.classList.add("table-bordered");
            table.classList.add("table-bordered-square");
            //table.classList.add("center");
        });
    }
  };
});

function SidebarnavCtrl($scope) {
    var items = $scope.items = $scope.$parent.items;
}
SidebarnavCtrl.$inject = ['$scope'];

function NavbarCtrl($scope, $timeout, $http, $location, $attrs) {
    $scope.items = $scope.items || [];
    
    this.select = $scope.select = function (item) {
        angular.forEach($scope.items, function (item) {
            item.selected = false;
        });
        item.selected = true;
    };

    this.selectByUrl = function (url) {
        angular.forEach($scope.items, function (item) {
            if ('http://'+ $scope.user + '.viewdocs.io/' + $scope.name + '/' + item.link === url) {
                $scope.select(item);
            }
        });
    };
}
NavbarCtrl.$inject = ['$scope', '$timeout','$http','$location','$attrs'];
