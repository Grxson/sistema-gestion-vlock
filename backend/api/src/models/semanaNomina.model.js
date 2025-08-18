const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SemanaNomina = sequelize.define('semanas_nomina', {
    id_semana: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semana_iso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    etiqueta: {
      type: DataTypes.STRING(50)
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Borrador', 'En_Proceso', 'Cerrada'),
      defaultValue: 'Borrador'
    }
  });

  SemanaNomina.associate = models => {
    SemanaNomina.hasMany(models.NominaEmpleado, { foreignKey: 'id_semana' });
  };

  return SemanaNomina;
};