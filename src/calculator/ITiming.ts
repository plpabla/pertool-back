export interface ITiming {
  tmin: number | null
  tmax: number | null
  tbuf: number | null
}

export const assertTimingStructure: ((obj: any) => void) = (obj) => {
  if (!('tmin' in obj)) { throw new Error('Wrong milestone structure passed (timing object - tmin missing)') }
  if (!('tmax' in obj)) { throw new Error('Wrong milestone structure passed (timing object - tmax missing)') }
  if (!('tbuf' in obj)) { throw new Error('Wrong milestone structure passed (timing object - tbuf missing)') }
}
