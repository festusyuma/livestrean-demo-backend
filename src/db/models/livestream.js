'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Livestream extends Model {
    static associate(models) {
    }
  }
  Livestream.init({
    sessionId: DataTypes.STRING,
    ended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Livestream',
  });
  return Livestream;
};