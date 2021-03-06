/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Cohort from '../api/cohort/cohort.model';

import config from './environment';
import Promise from 'bluebird';
import mongoose from 'mongoose-fill';   // mongoose-fill monkey-patches mongoose.

mongoose.Promise = Promise;

// FOR DEBUGGING
// mongoose.set('debug', (coll, method, query, doc) => {
//   console.log(`MONGOOSE DEBUG: ${coll} ${method} ${JSON.stringify(query)} ${JSON.stringify(doc)}`);
// });

console.log('config.env:', config.env);

import {createTestCohorts} from './seeds/seed-cohorts';
import {createTestSquads} from './seeds/seed-squads';
import {createTestUsers} from './seeds/seed-users';
import {createTestGroupProjects} from './seeds/seed-group-projects';
import {createTestHomework} from './seeds/seed-homework';
import {removeResourceOrgs, createResourceOrgs} from './seeds/seed-resource-orgs';
import {removeResources, createResources} from './seeds/seed-resources';
import {counts} from './seeds/counts';

function createProductionData() {
  console.log('\n=== Creating Production Data ===');
  return removeResourceOrgs()
  .then( () => createResourceOrgs() )
  .then( () => removeResources() )
  .then( () => {
    let promises = [
      createResources('./data/external-resources.json'),
      createResources('./data/atl-wdi-curriculum.json'),
      createResources('./data/atl-wdi-exercises.json'),
      createResources('./data/ga-wdi-lessons.json'),
      createResources('./data/ga-wdi-exercises.json'),
      createResources('./data/ga-wdi-boston.json'),
      createResources('./data/den-wdi-1.json'),
      createResources('./data/den-wdi-2.json'),
      createResources('./data/generalassembly-atx.json'),
      createResources('./data/wdi-sea.json')
    ];
    return Promise.all(promises);
  });
}

function createTestData() {
  console.log('\n=== Creating Test Data ===');
  return createTestCohorts()
  .then( () => createTestSquads() )
  .then( () => createTestUsers() )
  .then( () => createTestGroupProjects() )
  .then( () => createTestHomework() )
  .then( () => counts() );
}

if (config.env === 'development') {
  createProductionData()
  .then( () => createTestData() );
}
else {
  createProductionData();
}
