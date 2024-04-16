export interface ILink {
  id: number
  sourceId: number
  destId: number
  taskLength: number
  onCriticalPath?: boolean
}

export const extractLink: ((obj: any) => ILink) = (obj) => {
  return {
    id: obj.id,
    sourceId: obj.sourceId,
    destId: obj.destId,
    taskLength: obj.taskLength
  }
}

export const assertLinkStructure: ((obj: any) => void) = (obj) => {
  if (!('id' in obj)) { throw new Error('Wrong link structure passed (id)') }
  if (!('sourceId' in obj)) { throw new Error('Wrong link structure passed (sourceId)') }
  if (!('destId' in obj)) { throw new Error('Wrong link structure passed (destId)') }
  if (!('taskLength' in obj)) { throw new Error('Wrong link structure passed (taskLen)') }
}
