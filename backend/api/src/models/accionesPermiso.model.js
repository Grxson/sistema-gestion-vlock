export default (sequelize, DataTypes) => {
  const AccionPermiso = sequelize.define('acciones_permiso', {
    id_accion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_permiso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accion: {
      type: DataTypes.ENUM('ver', 'crear', 'editar', 'eliminar'),
      allowNull: false
    },
    permitido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  AccionPermiso.associate = models => {
    AccionPermiso.belongsTo(models.Rol, { foreignKey: 'id_rol' });
    AccionPermiso.belongsTo(models.Permiso, { foreignKey: 'id_permiso' });
  };

  return AccionPermiso;
};