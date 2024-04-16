import { type ITiming } from './ITiming.js'
import { assertTimingStructure } from './ITiming.js'

export interface IMilestone {
  id: number
  name: string
  sourceLinks: number[]
  destinationLinks: number[]
  timing: ITiming
  onCriticalPath?: boolean
}

export const extractMilestone: ((obj: any) => IMilestone) = (obj) => {
  return {
    id: obj.id,
    name: obj.name,
    sourceLinks: obj.sourceLinks,
    destinationLinks: obj.destinationLinks,
    timing: {
      tmin: obj.timing.tmin,
      tmax: obj.timing.tmax,
      tbuf: obj.timing.tbuf
    }
  }
}

export const assertMilestoneStructure: ((obj: any) => void) = (obj) => {
  if (!('id' in obj)) { throw new Error('Wrong milestone structure passed (missing id)') }
  if (!('sourceLinks' in obj) ||
  !Array.isArray(obj.sourceLinks)) {
    throw new Error('Wrong milestone structure passed (sourceLinks structure)')
  }
  if (!('destinationLinks' in obj) ||
  !Array.isArray(obj.destinationLinks)) {
    throw new Error('Wrong milestone structure passed (destinationLinks structure)')
  }
  if (!('timing' in obj)) { throw new Error('Wrong milestone structure passed (timing object)') }
  assertTimingStructure(obj.timing)
}
