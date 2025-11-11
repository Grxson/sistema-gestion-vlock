import React from 'react';
import { 
  FaTimes, FaSearch, FaFilter, FaChevronUp, FaChevronDown, 
  FaBuilding, FaBox, FaClock, FaTruck, FaRuler, FaEdit, 
  FaTrash, FaEye, FaFileExcel, FaFilePdf, FaFileImport,
  FaChevronLeft, FaChevronRight, FaReceipt, FaCalendarAlt, FaFileDownload
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { STANDARD_ICONS } from '../../constants/icons';
import FiltroTipoCategoria from '../common/FiltroTipoCategoria';
import DateRangePicker from '../ui/DateRangePicker';

const TablaGastosTab = ({
  // Datos
  searchTerm,
  filters,
  showFilters,
  proyectos,
  categoriasDinamicas,
  proveedores,
  ESTADOS_SUMINISTRO,
  paginatedSuministros,
  currentPage,
  totalPages,
  suministrosFiltrados,
  estadisticasTipo,
  
  // Funciones
  setSearchTerm,
  setFilters,
  setShowFilters,
  setShowMultipleModal,
  setShowUnidadesModal,
  handleEdit,
  handleDelete,
  handleViewDetails,
  setCurrentPage,
  handleImportClick,
  handleDownloadTemplate,
  handleOpenExportModal,
  onFiltroTipoChange,
  
  // Estados adicionales
  formatDate,
  formatUnidadMedida,
  getEstadoBadge,
  
  // Nuevos props para agrupación
  agruparSuministrosPorRecibo,
  expandedRecibos,
  toggleReciboExpansion,
  calculateTotal,
  handleEditRecibo,
  handleDeleteRecibo,
  handleViewRecibo,
  formatPriceDisplay
}) => {
  const [showControls, setShowControls] = React.useState(true);

  return (
    <>
      {/* Bloque de controles con icono toggle flotante */}
      <div className="  " style={{ minHeight: showControls ? 'auto' : '56px' }}>
        {/* Icono toggle flotante, nunca sobre la tabla */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="fixed top-24 right-10 z-30 bg-red-600 hover:bg-red-800 text-white p-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
          style={{ pointerEvents: 'auto' }}
          title={showControls ? "Ocultar controles de búsqueda y filtros" : "Mostrar controles de búsqueda y filtros"}
        >
          <FaChevronUp 
            className={`w-4 h-4 transition-transform duration-300 ${!showControls ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {/* Contenido de controles, solo visible si showControls */}
        {showControls && (
          <>
            <FiltroTipoCategoria
              filtroActivo={filters.tipo_categoria}
              onFiltroChange={onFiltroTipoChange}
              estadisticas={estadisticasTipo}
            />
          </>
        )}
      </div>

      {/* Controles superiores con diseño mejorado y distribución optimizada */}
      {showControls && (
        <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4">
        {/* Fila superior: Buscador y botones de acción */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-5">
          {/* Buscador */}
          <div className="relative w-full lg:flex-1 max-w-xl">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, folio o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <FaFilter className="w-3.5 h-3.5" />
              {showFilters ? 'Ocultar' : 'Filtros'}
              {(filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria) && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {[filters.categoria, filters.estado, filters.proyecto, filters.proveedor, filters.tipo_categoria].filter(f => f).length}
                </span>
              )}
              {showFilters ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowMultipleModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <STANDARD_ICONS.CREATE className="w-3.5 h-3.5" />
              Nuevo Suministro
            </button>
            <button
              onClick={() => setShowUnidadesModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              title="Gestionar Unidades de Medida"
            >
              <FaRuler className="w-3.5 h-3.5" />
              Unidades
            </button>
          </div>
        </div>

        {/* Rango de fechas y filtros desplegables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rango de fechas */}
          <div>
            <DateRangePicker
              startDate={filters.fechaInicio || ''}
              endDate={filters.fechaFin || ''}
              onChange={({ startDate, endDate }) => setFilters({ ...filters, fechaInicio: startDate, fechaFin: endDate })}
              startLabel="Fecha inicio"
              endLabel="Fecha fin"
            />
          </div>

          {/* Filtros desplegables */}
          {showFilters && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaFilter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Filtros de Suministros
                </h3>
                {(filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.fechaInicio || filters.fechaFin) && (
                  <button
                    onClick={() => setFilters({categoria: '', estado: '', proyecto: '', proveedor: '', tipo_categoria: '', fechaInicio: '', fechaFin: ''})}
                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 flex items-center gap-1.5 border border-red-300 dark:border-red-600 font-medium"
                  >
                    <FaTimes className="w-3 h-3" />
                    Limpiar
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Filtro por Proyecto */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaBuilding className="inline w-3 h-3 mr-1" />
                    Proyecto ({proyectos.length})
                  </label>
                  <select
                    value={filters.proyecto}
                    onChange={(e) => setFilters({...filters, proyecto: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectos.map((proyecto) => {
                      const nombreProyecto = proyecto.nombre_proyecto || proyecto.nombre || proyecto.title || proyecto.name || `Proyecto ${proyecto.id_proyecto || proyecto.id}`;
                      const idProyecto = proyecto.id_proyecto || proyecto.id;
                      return (
                        <option key={idProyecto} value={idProyecto}>
                          {nombreProyecto}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Filtro por Categoría */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaBox className="inline w-3 h-3 mr-1" />
                    Categoría
                  </label>
                  <select
                    value={filters.categoria}
                    onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasDinamicas.map((categoria, index) => (
                      <option key={`categoria-${categoria.id || categoria.id_categoria || index}`} value={categoria.id || categoria.id_categoria}>{categoria.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaClock className="inline w-3 h-3 mr-1" />
                    Estado
                  </label>
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Proveedor */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaTruck className="inline w-3 h-3 mr-1" />
                    Proveedor
                  </label>
                  <select
                    value={filters.proveedor}
                    onChange={(e) => setFilters({...filters, proveedor: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">Todos los proveedores</option>
                    {proveedores.map((proveedor) => (
                      <option 
                        key={proveedor.id_proveedor} 
                        value={proveedor.nombre}
                        title={proveedor.nombre}
                      >
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Tabla de Suministros */}
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-dark-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suministro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSuministros.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <FaBox className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay suministros que coincidan con los filtros seleccionados
                    </p>
                  </td>
                </tr>
              ) : (
                // Renderizado inteligente con agrupación jerárquica
                (() => {
                  const recibosAgrupados = agruparSuministrosPorRecibo(paginatedSuministros);
                  const rows = [];
                  
                  recibosAgrupados.forEach((recibo) => {
                    // Verificar si es una fila de nómina
                    const isNominaRow = recibo.suministros?.[0]?.isNominaRow || false;
                    
                    if (isNominaRow) {
                      // Renderizar fila de nómina
                      const nominaData = recibo.suministros[0];
                      // Buscar el nombre del proyecto usando id_proyecto
                      let nombreProyecto = '';
                      if (nominaData.id_proyecto) {
                        const proyectoObj = proyectos?.find(p => (p.id_proyecto || p.id) === nominaData.id_proyecto);
                        nombreProyecto = proyectoObj?.nombre || `Proyecto ${nominaData.id_proyecto}`;
                      }
                      rows.push(
                        <tr key={nominaData.id_suministro} className="bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors duration-150">
                          {/* Suministro (Nombre de nómina) */}
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <FaReceipt className="text-green-600 dark:text-green-400 w-4 h-4" />
                              <div>
                                <div className="font-semibold">{nominaData.nombre}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Proyecto: {nombreProyecto || nominaData.nombre_proyecto || 'Sin proyecto'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {nominaData.cantidad_empleados} empleado{nominaData.cantidad_empleados !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Folio */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            {nominaData.folio}
                          </td>
                          {/* Fecha */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            {formatDate(nominaData.fecha_inicio)} - {formatDate(nominaData.fecha_fin)}
                          </td>
                          {/* Categoría */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {nominaData.categoria}
                            </span>
                          </td>
                          {/* Proveedor */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            VLOCK
                          </td>
                          {/* Cantidad */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            {nominaData.cantidad} {nominaData.unidad_medida}
                          </td>
                          {/* Costo total */}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatPriceDisplay(nominaData.costo_total)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Pago semanal total
                              </div>
                            </div>
                          </td>
                          {/* Estado - OMITIDO para nóminas */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Nómina
                            </span>
                          </td>
                          {/* Acciones */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(nominaData)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 transition-colors duration-200"
                                title="Ver detalles de nómina"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      return; // Salir temprano, no procesar como suministro normal
                    }
                    
                    if (recibo.isHierarchical && filters.proveedor === '') {
                      // Grupo jerárquico - mostrar encabezado con opción de expandir
                      rows.push(
                        <tr key={`grupo-${recibo.id}`} className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                          {/* Suministro (Folio y proyecto) */}
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleReciboExpansion(recibo.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                {expandedRecibos.has(recibo.id) ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
                              </button>
                              <FaReceipt className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                              Folio: {recibo.folio || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {recibo.proyecto} • {formatDate(recibo.fecha)}
                            </div>
                          </td>
                          {/* Folio */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{recibo.folio || 'N/A'}</td>
                          {/* Fecha */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(recibo.fecha)}</td>
                          {/* Categoría */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {recibo.categoria || 'Múltiple'}
                          </td>
                          {/* Proveedor */}
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {recibo.proveedor}
                          </td>
                          {/* Cantidad */}
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{recibo.cantidad_items} artículos</td>
                          {/* Costo total */}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatPriceDisplay(recibo.total)}</td>
                          {/* Estado (vacío en agrupados) */}
                          <td className="px-6 py-4"></td>
                          {/* Acciones */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewRecibo(recibo)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 transition-colors duration-200"
                                title="Ver grupo completo"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditRecibo(recibo)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                                title="Editar grupo"
                              >
                                <STANDARD_ICONS.EDIT className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecibo(recibo)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors duration-200"
                                title="Eliminar grupo"
                              >
                                <STANDARD_ICONS.DELETE className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      
                      // Si está expandido, mostrar todos los suministros del grupo
                      if (expandedRecibos.has(recibo.id)) {
                        recibo.suministros.forEach((suministro) => {
                          rows.push(
                            <tr key={`sub-${suministro.id_suministro}`} className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                <div>
                                  <div className="font-medium">{
                                    (() => {
                                      const n = suministro.nombre_suministro || suministro.nombre;
                                      if (typeof n === 'object' && n !== null) return n.nombre || 'Sin nombre';
                                      if (Array.isArray(n) && n.length > 0) return n[0].nombre || n[0];
                                      return n || 'Sin nombre';
                                    })()
                                  }</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{
                                    (() => {
                                      const p = suministro.proyecto_info?.nombre_proyecto || suministro.proyecto_nombre || recibo.proyecto;
                                      if (typeof p === 'object' && p !== null) return p.nombre || '';
                                      if (Array.isArray(p) && p.length > 0) return p[0].nombre || p[0];
                                      return p || '';
                                    })()
                                  }</div>
                                  {suministro.codigo_producto && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">Código: {suministro.codigo_producto}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                                (() => {
                                  const f = suministro.folio;
                                  if (typeof f === 'object' && f !== null) return f.nombre || 'N/A';
                                  if (Array.isArray(f) && f.length > 0) return f[0].nombre || f[0];
                                  return f || 'N/A';
                                })()
                              }</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(suministro.fecha_entrega || suministro.fecha)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                                (() => {
                                  // Priorizar categoria del backend
                                  if (suministro.categoria && suministro.categoria.nombre) {
                                    return suministro.categoria.nombre;
                                  }
                                  // Fallback a otros campos
                                  const cat = suministro.categoria_info?.nombre || suministro.categoria_nombre || suministro.categoria;
                                  if (typeof cat === 'object' && cat !== null) return cat.nombre || 'Sin categoría';
                                  if (Array.isArray(cat) && cat.length > 0) return cat[0].nombre || cat[0];
                                  return cat || 'Sin categoría';
                                })()
                              }</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                                (() => {
                                  // Priorizar proveedor del backend
                                  if (suministro.proveedor && suministro.proveedor.nombre) {
                                    return suministro.proveedor.nombre;
                                  }
                                  // Fallback a otros campos
                                  const prov = suministro.proveedor_info?.nombre || suministro.proveedor_nombre || suministro.proveedor;
                                  if (typeof prov === 'object' && prov !== null) return prov.nombre || 'N/A';
                                  if (Array.isArray(prov) && prov.length > 0) return prov[0].nombre || prov[0];
                                  return prov || 'N/A';
                                })()
                              }</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{suministro.cantidad} {
                                (() => {
                                  // Priorizar unidadMedida.simbolo del backend
                                  if (suministro.unidadMedida && suministro.unidadMedida.simbolo) {
                                    return suministro.unidadMedida.simbolo;
                                  }
                                  // Fallback a otros campos
                                  const u = suministro.unidad_medida_info || suministro.unidad_medida;
                                  if (typeof u === 'object' && u !== null) {
                                    return u.simbolo || u.abreviatura || u.nombre || '';
                                  }
                                  if (Array.isArray(u) && u.length > 0) {
                                    return u[0].simbolo || u[0].abreviatura || u[0].nombre || u[0];
                                  }
                                  return formatUnidadMedida(u) || 'pza';
                                })()
                              }</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">{formatPriceDisplay(suministro.precio_unitario)} / {
                                    (() => {
                                      // Priorizar unidadMedida.simbolo del backend
                                      if (suministro.unidadMedida && suministro.unidadMedida.simbolo) {
                                        return suministro.unidadMedida.simbolo;
                                      }
                                      // Fallback a otros campos
                                      const u = suministro.unidad_medida_info || suministro.unidad_medida;
                                      if (typeof u === 'object' && u !== null) {
                                        return u.simbolo || u.abreviatura || u.nombre || '';
                                      }
                                      if (Array.isArray(u) && u.length > 0) {
                                        return u[0].simbolo || u[0].abreviatura || u[0].nombre || u[0];
                                      }
                                      return formatUnidadMedida(u) || 'pza';
                                    })()
                                  }</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Total: {formatPriceDisplay(calculateTotal(suministro))}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{
                                (() => {
                                  const e = suministro.estado;
                                  if (typeof e === 'object' && e !== null) return e.nombre || e.label || '';
                                  if (Array.isArray(e) && e.length > 0) return e[0].nombre || e[0].label || e[0];
                                  return getEstadoBadge(e);
                                })()
                              }</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{/* Acciones deshabilitadas para items individuales del grupo */}</div>
                              </td>
                            </tr>
                          );
                        });
                      }
                    } else {
                      // Suministro individual o filtrado por proveedor - renderizar normalmente
                      const suministro = recibo.suministros[0];
                      rows.push(
                        <tr key={suministro.id_suministro} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{
                                (() => {
                                  const n = suministro.nombre_suministro || suministro.nombre;
                                  if (typeof n === 'object' && n !== null) return n.nombre || 'Sin nombre';
                                  if (Array.isArray(n) && n.length > 0) return n[0].nombre || n[0];
                                  return n || 'Sin nombre';
                                })()
                              }</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{
                                (() => {
                                  const p = suministro.proyecto_info?.nombre_proyecto || suministro.proyecto_nombre || recibo.proyecto;
                                  if (typeof p === 'object' && p !== null) return p.nombre || '';
                                  if (Array.isArray(p) && p.length > 0) return p[0].nombre || p[0];
                                  return p || '';
                                })()
                              }</div>
                              {suministro.codigo_producto && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">Código: {suministro.codigo_producto}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                            (() => {
                              const f = suministro.folio;
                              if (typeof f === 'object' && f !== null) return f.nombre || 'N/A';
                              if (Array.isArray(f) && f.length > 0) return f[0].nombre || f[0];
                              return f || 'N/A';
                            })()
                          }</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(suministro.fecha_entrega || suministro.fecha)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                            (() => {
                              // Priorizar categoria del backend
                              if (suministro.categoria && suministro.categoria.nombre) {
                                return suministro.categoria.nombre;
                              }
                              // Fallback a otros campos
                              const cat = suministro.categoria_info?.nombre || suministro.categoria_nombre || suministro.categoria;
                              if (typeof cat === 'object' && cat !== null) return cat.nombre || 'Sin categoría';
                              if (Array.isArray(cat) && cat.length > 0) return cat[0].nombre || cat[0];
                              return cat || 'Sin categoría';
                            })()
                          }</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{
                            (() => {
                              // Priorizar proveedor del backend
                              if (suministro.proveedor && suministro.proveedor.nombre) {
                                return suministro.proveedor.nombre;
                              }
                              // Fallback a otros campos
                              const prov = suministro.proveedor_info?.nombre || suministro.proveedor_nombre || suministro.proveedor;
                              if (typeof prov === 'object' && prov !== null) return prov.nombre || 'N/A';
                              if (Array.isArray(prov) && prov.length > 0) return prov[0].nombre || prov[0];
                              return prov || 'N/A';
                            })()
                          }</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{suministro.cantidad} {
                            (() => {
                              // Priorizar unidadMedida.simbolo del backend
                              if (suministro.unidadMedida && suministro.unidadMedida.simbolo) {
                                return suministro.unidadMedida.simbolo;
                              }
                              // Fallback a otros campos
                              const u = suministro.unidad_medida_info || suministro.unidad_medida;
                              if (typeof u === 'object' && u !== null) {
                                return u.simbolo || u.abreviatura || u.nombre || '';
                              }
                              if (Array.isArray(u) && u.length > 0) {
                                return u[0].simbolo || u[0].abreviatura || u[0].nombre || u[0];
                              }
                              return formatUnidadMedida(u) || 'pza';
                            })()
                          }</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">{formatPriceDisplay(suministro.precio_unitario)} / {
                                (() => {
                                  // Priorizar unidadMedida.simbolo del backend
                                  if (suministro.unidadMedida && suministro.unidadMedida.simbolo) {
                                    return suministro.unidadMedida.simbolo;
                                  }
                                  // Fallback a otros campos
                                  const u = suministro.unidad_medida_info || suministro.unidad_medida;
                                  if (typeof u === 'object' && u !== null) {
                                    return u.simbolo || u.abreviatura || u.nombre || '';
                                  }
                                  if (Array.isArray(u) && u.length > 0) {
                                    return u[0].simbolo || u[0].abreviatura || u[0].nombre || u[0];
                                  }
                                  return formatUnidadMedida(u) || 'pza';
                                })()
                              }</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Total: {formatPriceDisplay(calculateTotal(suministro))}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{
                            (() => {
                              const e = suministro.estado;
                              if (typeof e === 'object' && e !== null) return e.nombre || e.label || '';
                              if (Array.isArray(e) && e.length > 0) return e[0].nombre || e[0].label || e[0];
                              return getEstadoBadge(e);
                            })()
                          }</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(suministro)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Ver detalles"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(suministro)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Editar"
                              >
                                <STANDARD_ICONS.EDIT className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(suministro.id_suministro)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar"
                              >
                                <STANDARD_ICONS.DELETE className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  });
                  
                  return rows;
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-dark-100 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{' '}
                    <span className="font-medium">{paginatedSuministros.length === 0 ? 0 : ((currentPage - 1) * 25 + 1)}</span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 25, suministrosFiltrados.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{suministrosFiltrados.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNumber === currentPage
                                ? 'z-10 bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400'
                                : 'bg-white dark:bg-dark-100 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Exportación e Importación */}
      <div className="mt-4 flex justify-end gap-2">
        {/* Botón Descargar Plantilla */}
        <button
          onClick={handleDownloadTemplate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          title="Descargar plantilla de Excel para importar datos"
        >
          <FaFileDownload className="w-4 h-4" />
          Descargar Plantilla
        </button>

          {/* Botón Exportar (abre modal) */}
          <button
            onClick={handleOpenExportModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            title="Configurar y exportar datos"
          >
            <FaFileExcel className="w-4 h-4" />
            Exportar
          </button>
        
        <button
          onClick={handleImportClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <FaFileImport className="w-4 h-4" />
          Importar Excel
        </button>
      </div>
    </>
  );
};

export default TablaGastosTab;
