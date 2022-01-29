'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OpenTokLVToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OpenTokLVToken.init({
    username: DataTypes.STRING,
    token: DataTypes.STRING,
    sessionId: DataTypes.STRING,
    minutesActive: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'OpenTokLVToken',
  });
  return OpenTokLVToken;
};