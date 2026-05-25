export async function exportReportAsImage(elementId: string, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn('Export target element not found:', elementId)
    return
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 750,
      windowWidth: 750,
      logging: false,
    })

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  } catch (err) {
    console.error('Export failed:', err)
  }
}
