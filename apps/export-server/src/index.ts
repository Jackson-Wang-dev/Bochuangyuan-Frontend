import express from 'express'
import { generateApplicationDocx } from './wordGenerator.js'
import type { ExportProject } from './types.js'

const app = express()
app.use(express.json({ limit: '10mb' }))

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.options('*', (_req, res) => { res.sendStatus(204) })

app.post('/export/docx', async (req, res) => {
  try {
    const project = req.body as ExportProject
    if (!project?.id) {
      res.status(400).json({ error: 'Missing project data' })
      return
    }
    const buf = await generateApplicationDocx(project)
    const filename = encodeURIComponent(`申报书_${project.declarationName || project.id}.docx`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`)
    res.send(buf)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: String(err) })
  }
})

const PORT = process.env.PORT ?? 3010
app.listen(PORT, () => {
  console.log(`Export server listening on http://localhost:${PORT}`)
})
