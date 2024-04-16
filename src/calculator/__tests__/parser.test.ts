import { extractModelFromObj } from '../IModel'
import { loadJSONfromFile } from '../filesystemHelper'
import path from 'path'

type StringMap = Record<string, string>
type JSONMap = Record<string, Record<string, unknown>>
const jsonStrings: StringMap = {}
const jsontestObj: JSONMap = {}

beforeAll(async () => {
  const files = ['one_milestone', 'two_milestones_and_link']

  await Promise.all(files.map(async (f) => {
    jsonStrings[f] = await loadJSONfromFile(path.join(__dirname, `./json/${f}.json`))
    jsontestObj[f] = JSON.parse(jsonStrings[f])
  }))
})

/// ////////////////////////////////////////////////////////////////
/// Wrong JSONS
/// ////////////////////////////////////////////////////////////////
test('Parsing empty JSON throws an error', () => {
  const testStr = '{}'
  const testObj = JSON.parse(testStr)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json with missing milestones throws an error', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/wrong_missing_milestones.json'))
  const testObj = JSON.parse(txt)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json with milestones which are not array throws an error', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/wrong_milestones_are_not_array.json'))
  const testObj = JSON.parse(txt)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json with invalid milestone throws an error', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/wrong_milestone_missing_some_fields.json'))
  const testObj = JSON.parse(txt)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json with missing links throws an error', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/wrong_missing_links.json'))
  const testObj = JSON.parse(txt)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json with links which are not array throws an error', async () => {
  const txt = await loadJSONfromFile(path.join(__dirname, './json/wrong_links_are_not_array.json'))
  const testObj = JSON.parse(txt)

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).toThrow()
})

test('Parsing json without missing fields does not throw', async () => {
  const testObj = jsontestObj.one_milestone

  const fn = (): any => {
    extractModelFromObj(testObj)
  }
  expect(fn).not.toThrow()
})

/// ////////////////////////////////////////////////////////////////
/// Correct JSON
/// ////////////////////////////////////////////////////////////////
test('Parsing correct JSON returns non-null testObject', async () => {
  const testObj = jsontestObj.two_milestones_and_link

  const model = extractModelFromObj(testObj)

  expect(model).toHaveProperty('milestones')
  expect(model).toHaveProperty('links')
})
