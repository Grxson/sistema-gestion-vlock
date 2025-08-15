export default (sequelize, DataTypes) => {
  const Adjunto = sequelize.define('adjuntos', {
    id_adjunto: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    nombre_archivo: { 
        type: DataTypes.STRING(180), 
        allowNull: false 
    },
    tipo_archivo: { 
        type: DataTypes.STRING(40), 
        allowNull: false 
    },
    ruta: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    peso_mb: { 
        type: DataTypes.DECIMAL(6,2) 
    },
    checksum: { 
        type: DataTypes.STRING(64) 
    },
    fecha_subida: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    },
    id_usuario: { 
        type: DataTypes.INTEGER, 
        allowNull: false
     }
  });
  Adjunto.associate = models => {
    Adjunto.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
    Adjunto.hasMany(models.AdjuntoRelacion, { foreignKey: 'id_adjunto' });
  };
  return Adjunto;
};