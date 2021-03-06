'use strict';

const Sequelize = require('sequelize');
const uuid = require('uuid');

const models = require('../models');

module.exports.getUser = async (ctx, next) => {
  if (ctx.method !== 'GET') return next();

  const { userId } = ctx.params;

  if (userId) {
    const userInfo = await models.User
      .findOne({
        where: {
          id: userId,
        },
      });

    const badges = await models.Achievement
      .findAll({
        where: {
          UserId: userId
        },
        include: {
          model: models.Badge
        }
      });

    const participations = await models.Participation
      .findAll({
        where: {
          UserId: userId
        },
        attributes: [
          'id',
          'UserId',
          'EventId',
          'startTime',
          'endTime',
          'distance',
        ],
        include: [
          {
            model: models.Comment
          },
          {
            model: models.Image
          },
        ]
      });

    const stats = await models.Participation
      .findAll({
        where: {
          UserId: userId
        },
        group: ['UserId'],
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('distance')), 'totalDistance'],
          [Sequelize.fn('ST_Area', Sequelize.fn('ST_Union', Sequelize.col('shape')), true), 'totalArea']
        ],
      });

    ctx.body = {
      userInfo,
      badges,
      participations,
      stats: stats[0],
    };
    ctx.status = 200;
  } else {
    ctx.status = 204;
  }
};

// Create a new user
module.exports.createUser = async (ctx, next) => {
  if (ctx.method !== 'POST') return next();

  const { body } = ctx.request;
  let newUser;

  if (body.email) {
    const user = await models.User
      .findOne({
        where: {
          email: body.email,
        }
      });

    if (user) {
      const badges = await models.Achievement
        .findAll({
          where: {
            UserId: user.id
          },
          include: {
            model: models.Badge
          }
        });

      const participations = await models.Participation
        .findAll({
          where: {
            UserId: user.id
          },
          attributes: [
            'id',
            'UserId',
            'EventId',
            'startTime',
            'endTime',
            'distance',
          ],
          include: [
            {
              model: models.Comment
            },
            {
              model: models.Image
            },
          ]
        });

      const stats = await models.Participation
        .findAll({
          where: {
            UserId: user.id
          },
          group: ['UserId'],
          attributes: [
            [Sequelize.fn('SUM', Sequelize.col('distance')), 'totalDistance'],
            [Sequelize.fn('ST_Area', Sequelize.fn('ST_Union', Sequelize.col('shape')), true), 'totalArea']
          ],
        });

      ctx.body = {
        ...user.dataValues,
        badges,
        participations,
        stats,
      };

      ctx.status = 200;
    } else {
      // Create new user on User table
      newUser = await models.User
        .create({
          id: uuid(),
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          token: body.token,
        });

      ctx.body = {
        ...newUser.dataValues,
        badges: [],
        participations: [],
        stats: {},
      };
      ctx.status = 201;
    }
  } else {
    ctx.status = 204;
  }
};
