import { create } from 'zustand'
import type { MaterialFile } from '@bochuangyuan/types'

interface PickerState {
  isOpen: boolean
  category?: MaterialFile['category']
  resolve: ((file: MaterialFile | null) => void) | null
}

interface MaterialState {
  files: MaterialFile[]
  isLoading: boolean
  picker: PickerState
  setFiles: (files: MaterialFile[]) => void
  addFile: (file: MaterialFile) => void
  removeFile: (fileId: string) => void
  setLoading: (loading: boolean) => void
  /**
   * Promise-based file picker. Opens the FilePicker modal and returns the
   * selected file, or null if the user cancels.
   *
   * Usage (in any component or store action):
   *   const file = await useMaterialStore.getState().pickFile()
   */
  pickFile: (category?: MaterialFile['category']) => Promise<MaterialFile | null>
  resolvePick: (file: MaterialFile | null) => void
}

export const useMaterialStore = create<MaterialState>()((set, get) => ({
  files: [],
  isLoading: false,
  picker: { isOpen: false, resolve: null },

  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (fileId) => set((state) => ({ files: state.files.filter((f) => f.fileId !== fileId) })),
  setLoading: (isLoading) => set({ isLoading }),

  pickFile: (category) =>
    new Promise<MaterialFile | null>((resolve) => {
      set({ picker: { isOpen: true, category, resolve } })
    }),

  resolvePick: (file) => {
    const { resolve } = get().picker
    resolve?.(file)
    set({ picker: { isOpen: false, resolve: null } })
  },
}))
