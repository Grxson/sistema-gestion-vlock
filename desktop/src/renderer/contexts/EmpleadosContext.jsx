import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/api';

const EmpleadosContext = createContext();

export const useEmpleados = () => {
  const context = useContext(EmpleadosContext);
  if (!context) {
    throw new Error('useEmpleados debe ser usado dentro de un EmpleadosProvider');
  }
  return context;
};

export const EmpleadosProvider = ({ children }) => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchEmpleados = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [EmpleadosContext] Iniciando fetch de empleados con filtros:', filters);
      }
      
      const response = await apiService.getEmpleados(filters);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 [EmpleadosContext] Respuesta recibida:', response);
        console.log('📡 [EmpleadosContext] Tipo de respuesta:', typeof response);
        console.log('📡 [EmpleadosContext] Claves de respuesta:', Object.keys(response || {}));
        console.log('📡 [EmpleadosContext] response.empleados:', response?.empleados);
      }
      
      // El backend devuelve { message: "...", empleados: [...] }
      const empleadosData = response?.empleados || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [EmpleadosContext] Empleados encontrados: ${empleadosData.length}`);
        console.log('📊 [EmpleadosContext] Datos de empleados:', empleadosData);
        console.log('🔄 [EmpleadosContext] Llamando setEmpleados con:', empleadosData.length, 'empleados');
      }
      
      setEmpleados(empleadosData);
      setLastUpdate(new Date());
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [EmpleadosContext] setEmpleados llamado con:', empleadosData.length, 'empleados');
        console.log('✅ [EmpleadosContext] Estado actualizado, empleados en estado:', empleadosData.length);
      }
      return empleadosData;
    } catch (error) {
      console.error('❌ [EmpleadosContext] Error fetching empleados:', error);
      console.error('❌ [EmpleadosContext] Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      // Si hay un error, mantener el estado actual de empleados
      // pero mostrar el error en la consola
      setEmpleados([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshEmpleados = useCallback(async (filters = {}) => {
    console.log('🔄 Refrescando empleados...');
    return await fetchEmpleados(filters);
  }, [fetchEmpleados]);

  const updateEmpleadoInList = useCallback((updatedEmpleado) => {
    setEmpleados(prevEmpleados => 
      prevEmpleados.map(emp => 
        emp.id_empleado === updatedEmpleado.id_empleado ? updatedEmpleado : emp
      )
    );
    setLastUpdate(new Date());
  }, []);

  const addEmpleadoToList = useCallback((newEmpleado) => {
    setEmpleados(prevEmpleados => [...prevEmpleados, newEmpleado]);
    setLastUpdate(new Date());
  }, []);

  const removeEmpleadoFromList = useCallback((empleadoId) => {
    setEmpleados(prevEmpleados => 
      prevEmpleados.filter(emp => emp.id_empleado !== empleadoId)
    );
    setLastUpdate(new Date());
  }, []);

  const getEmpleadoById = useCallback((id) => {
    return empleados.find(emp => emp.id_empleado === id);
  }, [empleados]);

  const getEmpleadosActivos = useCallback(() => {
    return empleados.filter(emp => emp.activo === 1 || emp.activo === true);
  }, [empleados]);

  // Inicializar empleados automáticamente al cargar el contexto
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 [EmpleadosContext] Inicializando contexto de empleados...');
      console.log('🚀 [EmpleadosContext] fetchEmpleados function:', typeof fetchEmpleados);
    }
    fetchEmpleados().catch(error => {
      console.error('❌ [EmpleadosContext] Error en inicialización:', error);
    });
  }, [fetchEmpleados]);

  // Debug: verificar cambios en el estado de empleados (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [EmpleadosContext] Estado de empleados cambió:', empleados.length, empleados);
    }
  }, [empleados]);

  const value = {
    empleados,
    loading,
    lastUpdate,
    fetchEmpleados,
    refreshEmpleados,
    updateEmpleadoInList,
    addEmpleadoToList,
    removeEmpleadoFromList,
    getEmpleadoById,
    getEmpleadosActivos
  };

  // Debug: verificar el estado del contexto (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [EmpleadosContext] Estado actual del contexto:', {
      empleados: empleados.length,
      loading,
      lastUpdate
    });
  }

  return (
    <EmpleadosContext.Provider value={value}>
      {children}
    </EmpleadosContext.Provider>
  );
};

export default EmpleadosContext;
