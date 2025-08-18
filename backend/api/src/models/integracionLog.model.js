const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IntegracionLog = sequelize.define('integraciones_log', {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.ENUM('Importacion', 'Exportacion'),
      allowNull: false
    },
    sistema: {
      type: DataTypes.STRING(50)
    },
    direccion: {
      type: DataTypes.ENUM('Entrada', 'Salida'),
      allowNull: false
    },
    archivo: {
      type: DataTypes.STRING(100)
    },
    filas_procesadas: {
      type: DataTypes.INTEGER
    },
    errores_json: {
      type: DataTypes.JSON
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  IntegracionLog.associate = models => {
    IntegracionLog.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
  };

  return IntegracionLog;
};