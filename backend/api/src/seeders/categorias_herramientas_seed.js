const { Op } = require('sequelize');

/**
 * Inicializar categorías de herramientas básicas
 */
const initCategoriasHerramientas = async (models) => {
    console.log('🔧 Inicializando categorías de herramientas...');

    const CategoriaHerramienta = models.Categorias_herramienta;

    const categoriasBasicas = [
        {
            id_categoria_herr: 1,
            nombre: 'Herramientas Manuales',
            descripcion: 'Herramientas de uso manual básico como martillos, destornilladores, llaves, etc.'
        },
        {
            id_categoria_herr: 2,
            nombre: 'Herramientas Eléctricas',
            descripcion: 'Herramientas que requieren energía eléctrica como taladros, sierras eléctricas, etc.'
        },
        {
            id_categoria_herr: 3,
            nombre: 'Equipo de Medición',
            descripcion: 'Instrumentos de medición y nivelación como niveles, flexómetros, escuadras, etc.'
        },
        {
            id_categoria_herr: 4,
            nombre: 'Herramientas de Corte',
            descripcion: 'Herramientas especializadas para cortar materiales como sierras, cortadoras, etc.'
        },
        {
            id_categoria_herr: 5,
            nombre: 'Equipo de Seguridad',
            descripcion: 'Herramientas y equipos de protección personal y seguridad en obra'
        },
        {
            id_categoria_herr: 6,
            nombre: 'Maquinaria Pesada',
            descripcion: 'Equipo y maquinaria de gran tamaño para construcción'
        },
        {
            id_categoria_herr: 7,
            nombre: 'Herramientas de Soldadura',
            descripcion: 'Equipo especializado para trabajos de soldadura y unión de metales'
        },
        {
            id_categoria_herr: 8,
            nombre: 'Herramientas de Pintura',
            descripcion: 'Herramientas para aplicación y preparación de pintura y acabados'
        },
        {
            id_categoria_herr: 9,
            nombre: 'Equipo de Elevación',
            descripcion: 'Herramientas y equipos para elevación y transporte de materiales'
        },
        {
            id_categoria_herr: 10,
            nombre: 'Herramientas Especializadas',
            descripcion: 'Herramientas específicas para trabajos especializados de construcción'
        }
    ];

    try {
        for (const categoria of categoriasBasicas) {
            await CategoriaHerramienta.findOrCreate({
                where: { id_categoria_herr: categoria.id_categoria_herr },
                defaults: categoria
            });
        }

        console.log('✅ Categorías de herramientas creadas o verificadas');
        return true;
    } catch (error) {
        console.error('❌ Error al crear categorías de herramientas:', error);
        return false;
    }
};

module.exports = { initCategoriasHerramientas };