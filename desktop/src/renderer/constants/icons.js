/**
 * Iconos estándar para acciones en todo el sistema
 * Usa Heroicons para consistencia visual
 */
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FolderIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export const STANDARD_ICONS = {
  // Acciones CRUD
  CREATE: PlusIcon,
  EDIT: PencilIcon,
  DELETE: TrashIcon,
  VIEW: EyeIcon,
  
  // Acciones de usuario
  ACTIVATE: UserPlusIcon,
  DEACTIVATE: UserMinusIcon,
  
  // Acciones generales
  CONFIRM: CheckIcon,
  CANCEL: XMarkIcon,
  WARNING: ExclamationTriangleIcon,
  
  // Navegación y organización
  DOCUMENT: DocumentTextIcon,
  FOLDER: FolderIcon,
  SETTINGS: CogIcon
};

export default STANDARD_ICONS;
