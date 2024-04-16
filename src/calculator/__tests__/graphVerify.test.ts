import { loadJSONfromFile } from '../filesystemHelper'
import { Model } from '../Model'
import path from 'path'

const testToThrow: (filename: string) => Promise<void> = async (jsonFilename) => {
  const txt = await loadJSONfromFile(path.join(__dirname, `./json/${jsonFilename}`))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  const fn = (): any => model.traverse()

  expect(fn).toThrow()
}

const testNotToThrow: (filename: string) => Promise<number[]> = async (jsonFilename) => {
  const txt = await loadJSONfromFile(path.join(__dirname, `./json/${jsonFilename}`))
  const testObj = JSON.parse(txt)
  const model: Model = new Model(testObj)

  const fn = (): any => model.traverse()

  let res: number[] = []
  expect(() => {
    res = fn()
  }).not.toThrow()
  return res
}

test('Model with more than two sources is not correct', async () => {
  await testToThrow('struct_two_sources.json')
})

test('Model with more than two last milestones is not correct', async () => {
  await testToThrow('struct_two_ends.json')
})

test('Model with an orphan is not correct', async () => {
  await testToThrow('struct_orphan.json')
})

test('Model with a cycle is not correct', async () => {
  await testToThrow('struct_loop.json')
})

test('Model with a single milestone is valid', async () => {
  await testNotToThrow('one_milestone.json')
})

test('Model with two milestones and a link is valid', async () => {
  await testNotToThrow('two_milestones_and_link.json')
})

test('Model with two paths is vald', async () => {
  await testNotToThrow('two_paths.json')
})

test('Model with two crossed paths is vald', async () => {
  await testNotToThrow('two_paths_extra_cross.json')
})

test('Slightly complex model is also valid', async () => {
  await testNotToThrow('demo_model.json')
})

test('Slightly complex model with a bug (loop) is invalid', async () => {
  await testToThrow('demo_model_with_loop.json')
})
