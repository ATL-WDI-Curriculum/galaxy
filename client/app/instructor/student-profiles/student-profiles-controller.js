'use strict';

(function() {
  class StudentProfilesController {
    constructor(Auth, Cohort, Squad, appConfig, $http, $filter, $rootScope) {
      console.log('StudentProfilesController is alive!');
      this.Auth = Auth;
      this.Cohort = Cohort;
      this.Squad = Squad;
      this.roles = appConfig.userRoles;
      this.$http = $http;
      this.$filter = $filter;

      this.loadStudents();
      this.cohorts = [];
      this.squads = [];

      $rootScope.$on('cohortChangeEvent', () => {
        this.loadStudents();
      });
      $rootScope.$on('squadChangeEvent', () => {
        this.loadStudents();
      });
    }

    get squad() {
      return this.Squad.getCurrentSquad();
    }

    loadStudents() {
      this.Auth.getCurrentUser(currentUser => {
        // TODO: DRY this up
        let theCohort = currentUser.role === 'student' ? currentUser.cohort : this.Cohort.getCurrentCohort();
        let theSquad  = this.squad;
        let cohortId = theCohort ? theCohort._id : undefined;
        let squadId = theSquad ? theSquad._id : undefined;
        return this.$http.get('/api/users',
                              { params: {
                                         role: 'student',
                                         cohort: cohortId,
                                         squad: squadId }
        })
        .then(response => {
          this.students = response.data;
        });
      });
    }

    // TODO: handle newly created cohorts
    loadCohorts(user) {
      if (this.cohorts.length) {
        this.setCohortInVM(user, user.cohort);
        return null;
      }
      else {
        return this.$http.get('/api/cohorts')
        .then((response) => {
          this.cohorts = response.data;
          this.setCohortInVM(user, user.cohort);
        });
      }
    }

    // TODO: handle newly created squads
    loadSquads(user) {
      if (this.squads.length) {
        this.setSquadInVM(user, user.squad);
        return null;
      }
      else {
        return this.$http.get('/api/squads')
        .then((response) => {
          this.squads = response.data;
          this.setSquadInVM(user, user.squad);
        });
      }
    }

    setCohortInVM(user, cohort) {
      if (!cohort) {
        return;
      }
      var selected = this.$filter('filter')(this.cohorts, {_id: cohort._id} );
      user.cohort = selected.length ? selected[0] : null;
    }

    setSquadInVM(user, squad) {
      if (!squad) {
        return;
      }
      var selected = this.$filter('filter')(this.squads, {_id: squad._id} );
      user.squad = selected.length ? selected[0] : null;
    }

    getAttendancePresentOrLate(user) {
      var presentOrLate = 0;
      user.attendance.forEach((a) => {
        if (a.value === 'present' || a.value === 'late') {
          console.log('whoop');
          ++presentOrLate;
        }
      });
      console.log('getAttendancePresentOrLate returning', presentOrLate);
      return presentOrLate;
    }

    getAttendancePercentage(user) {
      var total = user.attendance.length;
      return total === 0 ? 0.0 : this.getAttendancePresentOrLate(user) * 100.0 / total;
    }
  }

  class MySquadController extends StudentProfilesController {
    constructor(Auth, Cohort, Squad, appConfig, $http, $filter, $rootScope) {
      super(Auth, Cohort, Squad, appConfig, $http, $filter, $rootScope);
    }

    get squad() {
      let currentUser = this.Auth.getCurrentUser();
      return currentUser.squad;
    }
  }

  angular.module('galaxyApp')
  .component('studentProfiles', {
    templateUrl: 'app/instructor/student-profiles/student-profiles.html',
    controller: StudentProfilesController
  });

  angular.module('galaxyApp')
  .component('studentMySquad', {
    templateUrl: 'app/instructor/student-profiles/student-profiles.html',
    controller: MySquadController
  });

})();
