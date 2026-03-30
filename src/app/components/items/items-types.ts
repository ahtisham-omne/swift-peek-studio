/**
 * Shared type definitions for the Items Library module.
 * Extracted to avoid circular dependencies between components.
 */

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
  width: number;
  minWidth: number;
}
