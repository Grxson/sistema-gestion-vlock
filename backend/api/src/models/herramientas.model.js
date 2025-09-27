const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Herramienta = sequelize.define('herramientas', {
    id_herramienta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_categoria_herr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(50)
    },
    serial: {
      type: DataTypes.STRING(100)
    },
    costo: {
      type: DataTypes.DECIMAL(10,2)
    },
    vida_util_meses: {
      type: DataTypes.INTEGER
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 // 1=Disponible, 2=Prestado, 3=Mantenimiento, 4=Reparación, 5=Fuera de Servicio
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(100)
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    timestamps: false // No tiene createdAt ni updatedAt
  });

  Herramienta.associate = models => {
    // Usar los nombres tal como se registran en el índice de modelos
    if (models.Categorias_herramienta) {
      Herramienta.belongsTo(models.Categorias_herramienta, { foreignKey: 'id_categoria_herr' });
    }
    if (models.proyectos) {
      Herramienta.belongsTo(models.proyectos, { foreignKey: 'id_proyecto' });
    }
    if (models.Movimientos_herramienta) {
      Herramienta.hasMany(models.Movimientos_herramienta, { foreignKey: 'id_herramienta' });
    }
  };

  return Herramienta;
};