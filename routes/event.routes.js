'use strict';

const router = require('koa-router')();

const controller = require('../controllers/event.controller');

// Create routes for events
router
  .post('/', controller.createEvent)
  .post('/update', controller.updateEvent)
  .post('/end', controller.endEvent)
  .post('/join', controller.joinEvent)
  .get('/', controller.getEvent)
  .delete('/', controller.deleteEvent);

module.exports = router;
