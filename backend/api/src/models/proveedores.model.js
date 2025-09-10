const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proveedor = sequelize.define('proveedores', {
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Nombre del proveedor'
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true,
      comment: 'RFC del proveedor'
    },
    razon_social: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Razón social completa'
    },
    telefono: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Teléfonos de contacto (separados por comas si son múltiples)'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Email de contacto'
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección fiscal'
    },
    contacto_principal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del contacto principal'
    },
    tipo_proveedor: {
      type: DataTypes.ENUM('MATERIALES', 'SERVICIOS', 'EQUIPOS', 'MIXTO', 'TRANSPORTE', 'CONSTRUCCION', 'MANTENIMIENTO', 'CONSULTORIA', 'SUBCONTRATISTA', 'HERRAMIENTAS', 'COMBUSTIBLE', 'ALIMENTACION'),
      defaultValue: 'SERVICIOS',
      comment: 'Tipo de productos/servicios que ofrece'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Estado del proveedor'
    },
    banco: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Banco del proveedor'
    },
    cuentaBancaria: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de cuenta bancaria'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales'
    }
  }, {
    timestamps: true,
    tableName: 'proveedores',
    indexes: [
      {
        fields: ['nombre']
      },
      {
        fields: ['tipo_proveedor']
      },
      {
        fields: ['activo']
      }
    ]
  });

  Proveedor.associate = models => {
    // Un proveedor puede tener muchos suministros
    Proveedor.hasMany(models.Suministros, { 
      foreignKey: 'id_proveedor',
      as: 'suministros'
    });
  };

  return Proveedor;
};
