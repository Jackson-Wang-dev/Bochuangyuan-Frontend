// App-local types. Complex shared types live in @bochuangyuan/types.

export type ViewMode =
  | 'cockpit'
  | 'bp_edit'
  | 'workspace'
  | 'project_details'
  | 'competition_detail'
  | 'project_module_2'

export interface NavItem {
  path: string
  label: string
  icon?: string
}
