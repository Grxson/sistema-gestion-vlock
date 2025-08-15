export default (sequelize, DataTypes) => {
    const IntegracionLog = sequielize.define('integraciones_log',{
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
            type: DataTypes.STRING(60)
        },
        direccion: {
            type: DataTypes.ENUM('Entrada', 'Salida'),
            allowNull: false
        },
        archivo: {
            type: DataTypes.STRING(255)
        },
        filas_procesadas: {
            type: DataTypes.INTEGER
        },
        errors_json: {
            type: DataTypes.JSON
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })
    IntegracionLog.associate = model => {
        IntegracionLog.belongsTo(model.Usuario, { foreignKey: 'id_usuario'});
    }
    return IntegracionLog;
};