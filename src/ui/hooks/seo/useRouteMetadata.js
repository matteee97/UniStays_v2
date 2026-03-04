import { useLocation } from "react-router-dom";
import { ROUTE_METADATA, ROUTES } from "@/app/routes";

/**
 * Hook that returns the appropriate metadata for the current route
 * @returns {Object} Metadata object with title, description, and keywords
 */
export const useRouteMetadata = () => {
  const location = useLocation();
  
  // Get the current pathname
  const currentPath = location.pathname;
  
  // Find matching route metadata
  const findRouteMetadata = (path) => {
    // Direct match first
    if (ROUTE_METADATA[path]) {
      return ROUTE_METADATA[path];
    }
    
    // Check for dynamic routes (with parameters)
    for (const [routePath, metadata] of Object.entries(ROUTE_METADATA)) {
      if (routePath.includes(':')) {
        // Convert route pattern to regex
        const routeRegex = new RegExp(
          '^' + routePath.replace(/:[^/]+/g, '([^/]+)') + '$'
        );
        
        if (routeRegex.test(path)) {
          return metadata;
        }
      }
    }
    
    // Check for nested routes (remove trailing segments)
    const pathSegments = path.split('/').filter(Boolean);
    for (let i = pathSegments.length; i > 0; i--) {
      const partialPath = '/' + pathSegments.slice(0, i).join('/');
      if (ROUTE_METADATA[partialPath]) {
        return ROUTE_METADATA[partialPath];
      }
    }
    
    // Default fallback
    return ROUTE_METADATA[ROUTES.HOME] || {
      title: 'UniStays - Alloggi Universitari',
      description: 'Trova e pubblica alloggi universitari in Italia',
      keywords: 'alloggi universitari, affitti studenti'
    };
  };
  
  return findRouteMetadata(currentPath);
};

export default useRouteMetadata;
