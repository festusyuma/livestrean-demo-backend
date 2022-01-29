'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OpenTokLV extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OpenTokLV.init({
    sessionId: DataTypes.STRING,
    ended: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'OpenTokLV',
  });
  return OpenTokLV;
};