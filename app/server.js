import express from 'express'

const app = express()
app.use(express.static('dist'))
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.listen(3000, () => console.log('Listening on port 3000'))