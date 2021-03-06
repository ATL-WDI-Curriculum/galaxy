'use strict';

(function() {

  class ProjectRequirementsViewController {
    constructor() {
      console.log('ProjectRequirementsViewController is alive!');
      this.isCollapsed = true;
    }

    // TODO: DRY this up!
    getTotalScore(project) {
      let result = project.requirements.reduce( (sum, r) => {
        return sum += (r.score || r.score === 0) ? r.score : NaN;
      }, 0);
      return isNaN(result) ? 'NA' : result;
    }
  }

  angular.module('galaxyApp')
  .component('projectRequirementsView', {
    templateUrl: 'components/project-requirements-view/project-requirements-view.html',
    controller: ProjectRequirementsViewController,
    bindings: {
      project: '<'
    }
  });

})();
