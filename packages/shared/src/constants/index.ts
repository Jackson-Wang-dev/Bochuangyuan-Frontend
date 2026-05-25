export const APP_NAME = '博创园'
export const API_VERSION = 'v1'

export const MATERIAL_CATEGORIES = ['honor', 'ip', 'certificate', 'other'] as const
export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]
