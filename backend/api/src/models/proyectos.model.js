const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proyecto = sequelize.define('proyectos', {
    id_proyecto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY
    },
    fecha_fin: {
      type: DataTypes.DATEONLY
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Pausado', 'Finalizado'),
      defaultValue: 'Activo'
    },
    responsable: {
      type: DataTypes.STRING(100)
    },
    ubicacion: {
      type: DataTypes.STRING(200)
    },
    cliente_nombre: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    presupuesto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: false
  });

  Proyecto.associate = models => {
    Proyecto.hasMany(models.Gasto, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.Presupuesto, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.Ingreso, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.EstadoCuenta, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.MovimientoHerramienta, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.Nomina_empleado, { foreignKey: 'id_proyecto' });
    Proyecto.hasMany(models.Suministros, { 
      foreignKey: 'id_proyecto',
      as: 'suministros'
    });
  };

  return Proyecto;
};