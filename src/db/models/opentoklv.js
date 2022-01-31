'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpenTokLV extends Model {
    static associate(models) {
    }
  }

  OpenTokLV.init({
    sessionId: DataTypes.STRING,
    ended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'OpenTokLV',
  });

  return OpenTokLV;
};
