import { useMaterialStore } from '@/store/materialStore'
import { FilePickerModal } from './index'

export function GlobalFilePicker() {
  const isOpen = useMaterialStore((s) => s.picker.isOpen)
  const category = useMaterialStore((s) => s.picker.category)
  const resolvePick = useMaterialStore((s) => s.resolvePick)

  return (
    <FilePickerModal
      isOpen={isOpen}
      category={category}
      onClose={() => resolvePick(null)}
      onSelect={(file) => resolvePick(file)}
    />
  )
}
