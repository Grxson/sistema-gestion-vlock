const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Adjunto = sequelize.define('adjuntos', {
    id_adjunto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tipo_archivo: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    ruta: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    peso_mb: {
      type: DataTypes.DECIMAL(5, 2)
    },
    checksum: {
      type: DataTypes.STRING(100)
    },
    fecha_subida: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Adjunto.associate = models => {
    if (models.Usuario) {
      Adjunto.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
    }
    if (models.AdjuntoRelaciones) {
      Adjunto.hasMany(models.AdjuntoRelaciones, { foreignKey: 'id_adjunto' });
    }
  };

  return Adjunto;
};