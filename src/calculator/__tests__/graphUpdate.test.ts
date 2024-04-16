import { loadJSONfromFile } from '../filesystemHelper'
import { type IMilestone } from '../IMilestone'
import { type IModel } from '../IModel'
import { Model } from '../Model'
import path from 'path'

test('Ordering field (name) is updated for inverted traverse order', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/order_id_inverted.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated = model.getModel()
  expect(modelUpdated.milestones[0].name).toBe('0')
  expect(modelUpdated.milestones[1].name).toBe('1')
})

test('Calculation changes original order of milestones', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/order_id_inverted.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated = model.getModel()
  expect(modelUpdated.milestones[0].id).toBe(1)
  expect(modelUpdated.milestones[1].id).toBe(0)
})

test('Root milestone has set tmin,tmax and tbuff to zero', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/order_id_inverted.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated = model.getModel()
  expect(modelUpdated.milestones[0].timing.tmin).toBe(0)
  expect(modelUpdated.milestones[0].timing.tmax).toBe(0)
  expect(modelUpdated.milestones[0].timing.tbuf).toBe(0)
})

test('2nd milestone have updated tmin as t0+taskLen', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/two_milestones_and_link.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated: IModel = model.getModel()
  expect(modelUpdated.milestones.pop()?.timing.tmin).toBe(5)
})

test('For parallel path tmin is selected as max of paths', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/final_at_9.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated: IModel = model.getModel()
  expect(modelUpdated.milestones.pop()?.timing.tmin).toBe(9)
})

test('Last milestone tmin=tmax', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/two_milestones_and_link.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated: IModel = model.getModel()
  const lastMilestone: IMilestone | undefined = modelUpdated.milestones.pop()
  if (lastMilestone === undefined) { throw new Error('there were no milestones in the model') }
  expect(lastMilestone.timing.tmin).toBe(lastMilestone.timing.tmax)
})

test('Second milestone tmin=tmax if only one path is present', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/one_path.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const modelUpdated: IModel = model.getModel()
  const firstMilestone: IMilestone | undefined = modelUpdated.milestones[1]
  if (firstMilestone === undefined) { throw new Error('there were no milestones in the model') }
  expect(firstMilestone.timing.tmin).toBe(firstMilestone.timing.tmax)
})

test('When model with no onCriticalPath is loaded, I still can work with it', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/one_path.json'))
  const testObj = JSON.parse(txt)

  const model: Model = new Model(testObj)

  const obj = model.getModel()
  obj.links.forEach(l => {
    if (Object.hasOwn(l, 'onCriticalPath')) {
      expect(l.onCriticalPath).toBe(false)
    }
  })
  obj.milestones.forEach(m => {
    if (Object.hasOwn(m, 'onCriticalPath')) {
      expect(m.onCriticalPath).toBe(false)
    }
  })
})

test('When model with no onCriticalPath is loaded, after calculation it gets onCriticalPath property', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/one_path.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()
  const obj = model.getModel()

  obj.links.forEach(l => { expect(Object.hasOwn(l, 'onCriticalPath')).toBe(true) })
  obj.milestones.forEach(m => { expect(Object.hasOwn(m, 'onCriticalPath')).toBe(true) })
})

test('After calculations onCriticalPath milestones are highlighted as supposed', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/critical_path.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const obj = model.getObj()

  expect(obj.milestones
    .filter((m: any) => m.description === 'onCritical')
    .every((m: any) => m.onCriticalPath === true)).toBe(true)
  expect(obj.milestones
    .filter((m: any) => m.description !== 'onCritical')
    .every((m: any) => m.onCriticalPath === false)).toBe(true)
})

test('After calculations onCriticalPath links are highlighted as supposed', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/critical_path.json'))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  model.calculate()

  const obj = model.getModel()
  expect(obj.links
    .filter(l => l.taskLength === 1 || l.taskLength === 10)
    .every(l => l.onCriticalPath === true)).toBe(true)
  expect(obj.links
    .filter(l => l.taskLength === 0 || l.taskLength === 6)
    .every(l => l.onCriticalPath === true)).toBe(false)
})
