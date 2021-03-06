'use strict';

import {Router} from 'express';
import * as controller from './settings.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);

export default router;
