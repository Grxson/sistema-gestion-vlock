export default (sequelize, DataTypes) => {
  const ReporteGenerado = sequelize.define('reportes_generados', {
    id_reporte: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    tipo_reporte: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    parametros_json: { 
        type: DataTypes.JSON 
    },
    formato: { 
        type: DataTypes.ENUM('CSV', 'XLSX', 'PDF'), 
        allowNull: false, 
        defaultValue: 'PDF' 
    },
    ruta_archivo: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    fecha_generacion: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    },
    id_usuario: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
  });
  ReporteGenerado.associate = models => {
    ReporteGenerado.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
  };
  return ReporteGenerado;
};