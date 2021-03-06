/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/resource-orgs',  require('./api/resource-org'));
  app.use('/api/resources',      require('./api/resource'));
  app.use('/api/projects',       require('./api/project'));
  app.use('/api/group-projects', require('./api/group-project'));
  app.use('/api/homeworks',      require('./api/homework'));
  app.use('/api/attendances',    require('./api/attendance'));
  app.use('/api/squads',         require('./api/squad'));
  app.use('/api/cohorts',        require('./api/cohort'));
  app.use('/api/users',          require('./api/user'));
  app.use('/api/settings',       require('./api/settings'));

  app.use('/auth',               require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
