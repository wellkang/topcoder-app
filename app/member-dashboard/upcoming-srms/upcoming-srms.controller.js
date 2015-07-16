(function () {
  'use strict';

  angular.module('tc.myDashboard').controller('UpcomingSRMsController', UpcomingSRMsController);

  UpcomingSRMsController.$inject = ['$location', 'TcAuthService','SRMService', 'CONSTANTS'];

  function UpcomingSRMsController($location, TcAuthService, SRMService, CONSTANTS) {
    var vm = this;
    vm.communityBaseUrl = $location.protocol() + ":" + CONSTANTS.COMMUNITY_URL;
    vm.loading = true;
    vm.pageIndex = 1;
    vm.pageSize = 5;
    vm.sortColumn = 'registrationStartTime';
    vm.sortOrder = 'asc';
    vm.totalPages = 1;
    vm.totalRecords = vm.totalPages * vm.pageSize;
    vm.firstRecordIndex = (vm.pageIndex - 1) * vm.pageSize + 1;
    vm.lastRecordIndex = vm.totalPages * vm.pageSize;
    vm.pageLinks = [];
    vm.prevPageLink = {};
    vm.nextPageLink = {};
    vm.changePage = changePage;
    vm.isCurrentPage = isCurrentPage;
    vm.getCurrentPageClass = getCurrentPageClass;
    vm.sort = sort;

    // activate controller
    if (TcAuthService.isAuthenticated() === true) {
      getSRMs();
    } else {
      return false;
    }

    // Fetches upcoming SRMs from the API
    function getSRMs() {
      initPaging();
      var searchRequest = {
        pageIndex: vm.pageIndex,
        pageSize: vm.pageSize,
        sortColumn: vm.sortColumn,
        sortOrder: vm.sortOrder
       };
      // start loading
      vm.loading = true;
      // Fetch the future srms scheduled
      return SRMService.getSRMSchedule(searchRequest)
        .then(function(data) {
          if (data.pagination) {
            vm.totalPages = Math.ceil(data.pagination.total / vm.pageSize);
            vm.totalRecords = data.pagination.total;
            vm.firstRecordIndex = (vm.pageIndex - 1) * vm.pageSize + 1;
            vm.lastRecordIndex = vm.pageIndex * vm.pageSize;
            vm.lastRecordIndex = vm.lastRecordIndex > vm.totalRecords ? vm.totalRecords : vm.lastRecordIndex;
          }
          vm.upcomingSRMs = data;
          vm.loading = false;
      });
    }

    /**
     * changePage changes page in the result set
     *
     * @param {JSON} pageLink page link object
     *
     * @return {Object} promise of API call with updated pageIndex
     */
    function changePage(pageLink) {
      vm.pageIndex = pageLink.val;
      getSRMs();
    }

    /**
     * isCurrentPage checks if the give page link is the current page
     *
     * @param {JSON} pageLink page link object
     *
     * @return {Boolean} true if the given page is the current page, false otherwise
     */
    function isCurrentPage (pageLink) {
      return pageLink.val === vm.pageIndex;
    }

    // Identifies the css class to be used for the given page link
    function getCurrentPageClass(pageLink) {
      return isCurrentPage(pageLink) ? 'current-page' : '';
    }

    // sorts the results based on the given column
    function sort(column) {
      if (vm.sortColumn === column) {
        vm.sortOrder = vm.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        vm.sortOrder = 'desc';
      }
      vm.sortColumn = column;
      getSRMs();
    }

    // Initializes the paging
    function initPaging() {
      vm.prevPageLink = {text: "Prev", val: vm.pageIndex - 1};
      vm.nextPageLink = {text: "Next", val: vm.pageIndex + 1};
    }
  }


})();