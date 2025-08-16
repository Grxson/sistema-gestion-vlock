export default (sequelize, DataTypes) => {
  const AdjuntoRelacion = sequelize.define('adjuntos_relaciones', {
    id_relacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_adjunto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entidad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    id_registro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_evidencia: {
      type: DataTypes.STRING(50)
    }
  });

  AdjuntoRelacion.associate = models => {
    AdjuntoRelacion.belongsTo(models.Adjunto, { foreignKey: 'id_adjunto' });
  };

  return AdjuntoRelacion;
};