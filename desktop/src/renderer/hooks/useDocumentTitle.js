import { useEffect } from 'react';

/**
 * Hook para actualizar el título del documento dinámicamente
 * @param {string} title - El título a establecer
 * @param {boolean} useAppName - Si incluir el nombre de la app al final
 */
export const useDocumentTitle = (title, useAppName = true) => {
  useEffect(() => {
    const appName = import.meta.env.VITE_APP_FULL_NAME || import.meta.env.VITE_APP_NAME || 'Vlock';
    
    if (title && useAppName) {
      document.title = `${title} - ${appName}`;
    } else if (title) {
      document.title = title;
    } else {
      document.title = appName;
    }
    
    // Actualizar también la meta description si existe
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const description = import.meta.env.VITE_APP_DESCRIPTION || 'Administra materiales, herramientas y equipos para proyectos';
      metaDescription.setAttribute('content', description);
    }
    
    // Actualizar application-name
    const metaAppName = document.querySelector('meta[name="application-name"]');
    if (metaAppName) {
      metaAppName.setAttribute('content', import.meta.env.VITE_APP_NAME || 'Vlock');
    }
    
  }, [title, useAppName]);
};

export default useDocumentTitle;
