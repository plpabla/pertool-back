import express from 'express'
import cors from 'cors'
import { Model } from './calculator/index.js'

const app = express()
const port = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/test', (req:any,res:any)=> {
  res.type('application/json')
  res.send({
    'msg':'Yes, I\'m alive!'
  })
})

app.post('/api/calculate', (req:any, res:any) => {
  const data = req.body
  let model:Model|null = null

  try {
    model = new Model(data)
    model.calculate()
    console.log(model)
  } catch (e) {
    res.statusCode = 400
    res.type('application/json')
    res.send({'msg': 'something didn\'t work'})
    return
  }

  res.type('application/json')
  res.send(model.getObj())
})

app.use((req:any, res:any) => {
  console.log('404....')
  res.type('text/plain')
  res.status(404)
  res.send('404 - not found :/')
})

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.message)
  res.type('text/plain')
  res.status(500)
  res.send('500 - server error')
})


app.listen(port, () => {
  console.log(`Express is running at http://localhost:${port}
Press Ctrl+C to stop`)
})
