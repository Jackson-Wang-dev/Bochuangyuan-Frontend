export type ID = string
export type ISODate = string
export type Money = number

export interface FileRef {
  key: string
  name: string
  size?: number
  mime?: string
}
