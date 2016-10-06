'use strict';

(function() {

  function contains(tags, tagToMatch) {
    let nameToMatch = tagToMatch.name || tagToMatch;
    return tags.reduce( (acc, tag) => acc || (tag.name || tag) === nameToMatch, false);
  }

  angular.module('galaxyApp')
  .filter('tagfilter', () => {
    return function(resources, allTags, mode) {
      let includedTags = allTags.filter( tag => tag.mode === 'include' );
      let excludedTags = allTags.filter( tag => tag.mode === 'exclude' );

      // if no filtering, return all of the resources
      if (includedTags.length === 0 && excludedTags.length === 0) {
        return resources;
      }

      // apply the included tags filtering using either "any" or "all" filtering.
      let any = resource => resource.tags.reduce((acc, tag) => acc || contains(includedTags , tag), false);
      let all = resource => includedTags. reduce((acc, tag) => acc && contains(resource.tags, tag), true );
      let f = mode === 'any' ? any : all;
      let result = includedTags.length === 0 ? resources : resources.filter(f);

      // filter out the resources that contain an excluded tag
      let exclude = resource => excludedTags.reduce((acc, tag) => acc && !contains(resource.tags, tag), true );
      return result.filter(exclude);
    };
  });

})();
