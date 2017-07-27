//Factory settings for controller
crawlApp.factory('syncItems', ['$http', '$q', function($http,$q) {
    var HOST_NAME               = '<?php echo SITE_URL; ?>';
    var product_list_url           =  HOST_NAME+"source_inventory/product_list/";
    var sync_url                =  HOST_NAME+"source_inventory/sync_product/"; 
    var unsync_count_url        =  HOST_NAME+"source_inventory/get_unsync_count/"; 
   
    var getGridItems = function (offset,limit,search) {
        var deferred = $q.defer();
        var path =product_list_url+offset+'/'+limit+'/'+search;
        $http.get(path)
        .success(function(data,status,headers,config){deferred.resolve(data);})
        .error(function(data, status, headers, config) { deferred.reject(status);});
        return deferred.promise;
    };
    var sync_product=function(){
         return $http({
                      method: "post",
                      url: sync_url,
                      data:{
                          id:1
                      }
                     }); 
                   
    };
     var unsync_count=function(){
         return $http({
                      method: "post",
                      url: unsync_count_url,
                      data:{
                          id:1
                      }
                     }); 
                   
    };
    return {
       getData: getGridItems,
       unsync_count:unsync_count,
       sync_product:sync_product
      
    }; 
}]);
// Define controller & its scope.
crawlApp.controller('synclistCtrl', ['$scope','syncItems',function($scope,syncItems) {
     $scope.itemsPerPage = 30;
     $scope.currentPage = 1;
     $scope.filter={};
     $scope.filter.is_completed=0;
     $scope.searchJSON='';
     $scope.paginate={};
     $scope.paginate.go_to=$scope.currentPage;
     $scope.work={};
     $scope.total=null;
     $scope.completed=null;
     $scope.work.unsynced=0;
     $scope.showUpdate=false;
     $scope.reverse=false;
     $scope.sel=null;
     $scope.setsel = function(key) {  
        $scope.sel = key;
     }
     //Function to select all checkboxes
    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.pagedItems, function (item) {
            item.Selected = $scope.selectedAll;
        });
    };
    $scope.range = function() 
    {
      var rangeSize = 5;
      var ret = [];
      var start;
      start = $scope.currentPage;
      if ( start > $scope.pageCount()-rangeSize ) {
        start = $scope.pageCount()-rangeSize;
      }
      for (var i=start; i<=start+rangeSize; i++) {
        if(i>1)
        ret.push(i);
      }
      return ret;
    };
    //scope used to navigate to previous page
    $scope.prevPage = function() 
    {
      if ($scope.currentPage > 1)
      {
        $scope.currentPage--;
      }
    };
    //disable previous page option for first page.
    $scope.prevPageDisabled = function() 
    {
      return $scope.currentPage === 1 ? "disabled" : "";
    };
    //scope used to navigate to next page
    $scope.nextPage = function() 
    {
      if ($scope.currentPage < $scope.pageCount()) 
      {
        $scope.currentPage++;
      }
    };
    //disable next page option for last page
    $scope.nextPageDisabled = function() 
    {
      if($scope.currentPage === $scope.pageCount() - 1)
      {
        return "disabled";
      }
      else
      {
        return "";
      }
    };
    //navigate to page
    $scope.go_to_page=function()
    {
      $scope.setPage(parseInt($scope.paginate.go_to)); 
    }

    $scope.pageCount = function() {
      return Math.ceil($scope.total/$scope.itemsPerPage);
    };

    $scope.setPage = function(n) {
      if (n > 0 && n <= $scope.pageCount()) {
        $scope.currentPage = n;
      }
    };

      
    $scope.$watch("currentPage", function(newValue, oldValue) {
      $scope.paginate.go_to=newValue;
      $scope.get_product_list(newValue - 1);
    });
    $scope.get_product_list=function(pg_no)
    {
      var promise=syncItems.getData( pg_no * $scope.itemsPerPage, $scope.itemsPerPage,$scope.searchJSON);
      promise.then(function(value){
                 $scope.pagedItems=value.datalist;
                 $scope.total=value.total;
                 
          }, 
        function(reason) {
          console.log("Reason"+reason);
        });
    } 
    $scope.filtergrid=function()
    {
      var argum=JSON.stringify($scope.filter);
      $scope.searchJSON=encodeURIComponent(argum);
      $scope.currentPage = 1;
      $scope.paginate.go_to=1;
      $scope.get_product_list($scope.currentPage - 1);
      
    }

    $scope.sync_product=function()
    {
        // alert("Work on progress");
       $.blockUI({ css: { 
            border: 'none', 
            padding: '3px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        } });
  
      syncItems.sync_product().success(
       function( returnset )
       {
         $.unblockUI();
            if(parseInt(returnset.status_code)==0)
            {
              swal("Error!",returnset.status_text, "error");
            }
            else if(parseInt(returnset.status_code)==1)
            {
              swal("Success!",returnset.status_text, "success");
            }
     });  
    } 
    $scope.unsync_count=function()
    {
      syncItems.unsync_count().success(
       function( returnset )
       {
            if(parseInt(returnset.status_code)==0)
            {
              swal("Error!",returnset.status_text, "error");
            }
            else if(parseInt(returnset.status_code)==1)
            {
              $scope.work.unsynced=parseInt(returnset.unsynced) > 0 ? parseInt(returnset.unsynced) : $scope.work.unsynced ;
            }
     });  
    }
    $scope.unsync_count();
    $scope.sortBy = function(propertyName)
    {
        $scope.reverse=($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;

    }
   
}]);