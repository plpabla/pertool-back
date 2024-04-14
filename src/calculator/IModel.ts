import { assertLinkStructure, type ILink } from './ILink.js'
import { assertMilestoneStructure, type IMilestone } from './IMilestone.js'
import { extractMilestone } from './IMilestone.js'
import { extractLink } from './ILink.js'

export interface IModel {
  links: ILink[]
  milestones: IMilestone[]
}

export const extractModelFromObj: ((obj: any) => IModel) = (obj) => {
  assertModelStructure(obj)
  const milestones: IMilestone[] = obj.milestones.map(extractMilestone)
  const links: ILink[] = obj.links.map(extractLink)

  return {
    milestones,
    links
  }
}

const assertModelStructure: ((obj: any) => void) = (obj) => {
  if (!('milestones' in obj)) { throw new Error('Missing milestones') }
  if (!('links' in obj)) { throw new Error('Missing links') }
  if (!Array.isArray(obj.milestones)) { throw new Error('milestones element is not an array') }
  if (!Array.isArray(obj.links)) { throw new Error('milestones element is not an array') }
  obj.milestones.forEach((m: any) => { assertMilestoneStructure(m) })
  obj.links.forEach((l: any) => { assertLinkStructure(l) })
}
