import { type IMilestone } from './IMilestone.js'
import { type IModel } from './IModel.js'
import { type ILink } from './ILink.js'
import { extractModelFromObj } from './IModel.js'

export class Model {
  private readonly obj: any
  private readonly model: IModel

  constructor (obj: any) {
    this.obj = JSON.parse(JSON.stringify(obj))
    this.model = extractModelFromObj(this.obj)
    this.model.links.forEach((l) => { l.onCriticalPath = false })
    this.model.milestones.forEach((m) => { m.onCriticalPath = false })
  }

  getModel (): IModel {
    return this.model
  }

  getModelCopy (): IModel {
    return JSON.parse(JSON.stringify(this.model))
  }

  getObj (): any {
    return this.obj
  }

  traverse (): number[] {
    if (this.getFirstCount() !== 1) { throw new Error('Not one root milestone') }
    if (this.getLastCount() !== 1) { throw new Error('Not one final milestone') }

    const model: IModel = this.getModelCopy()
    const root: IMilestone = model.milestones.filter(m => m.destinationLinks.length === 0)[0]
    const stack: IMilestone[] = [root]
    const visited: number[] = []
    while (stack.length > 0) {
      const m: IMilestone | undefined = stack.pop()
      if (m === undefined) break
      visited.push(m.id)

      m.sourceLinks.forEach((id) => {
        const link: ILink = this.getItemById(model.links, id) as ILink

        const m2: IMilestone = this.getItemById(model.milestones, link.destId) as IMilestone

        const linkLocInArray = m2.destinationLinks.indexOf(link.id)
        m2.destinationLinks.splice(linkLocInArray, 1)

        if (m2.destinationLinks.length === 0) { stack.push(m2) }
      })
    }

    if (visited.length !== model.milestones.length) {
      throw new Error('Not all milestones were reached while traversing')
    }
    return visited
  }

  calculate (): void {
    const milestones = this.model.milestones
    const links = this.model.links
    const order = this.traverse()
    this.reorderMilestones(order)
    // milestones[0].timing = { tmin: 0, tmax: 0, tbuf: 0 }

    milestones.reduce<number>((acc: number, m: IMilestone) => {
      const tmin = m.destinationLinks.reduce<number>((tmin: number, linkIdx: number) => {
        const l: ILink = this.getItemById(links, linkIdx) as ILink
        const m0: IMilestone = this.getItemById(milestones, l.sourceId) as IMilestone
        // @ts-expect-error: Object is possibly 'null'.
        return Math.max(tmin, m0.timing.tmin + l.taskLength)
      }, 0)

      m.timing.tmin = tmin
      m.timing.tmax = 0
      m.timing.tbuf = 0
      return 0
    }, 0)

    const tmaxOfFullPath = milestones[milestones.length - 1].timing.tmin
    if (tmaxOfFullPath === null) { throw new Error('Wrong model passed (no milestones)') }
    milestones[milestones.length - 1].timing.tmax = tmaxOfFullPath

    milestones.reduceRight<number>((acc: number, m: IMilestone) => {
      const tmax = m.sourceLinks.reduce<number>((tmax: number, linkIdx: number) => {
        const l: ILink = this.getItemById(links, linkIdx) as ILink
        const m0: IMilestone = this.getItemById(milestones, l.destId) as IMilestone
        // @ts-expect-error: Object is possibly 'null'.
        return Math.min(tmax, m0.timing.tmax - l.taskLength)
      }, tmaxOfFullPath)

      m.timing.tmax = tmax
      // @ts-expect-error: Object is possibly 'null'.
      m.timing.tbuf = tmax - m.timing.tmin
      return 0
    }, 0)

    this.highlightCriticalPath()

    this.updateObjectData()
  }

  private reorderMilestones (order: number[]): void {
    order.forEach((item, count) => {
      const m: IMilestone = this.getItemById(this.model.milestones, item) as IMilestone
      m.name = count.toString()
    })
    this.model.milestones.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }

  private getItemById (collection: IMilestone[] | ILink[], id: number): IMilestone | ILink {
    const item: ILink | IMilestone | undefined = collection.find(i => i.id === id)
    if (item === undefined) { throw new Error('Wrong item ID: ' + id) }
    return item
  }

  private getFirstCount (): number {
    return this.model.milestones.filter((m: IMilestone): boolean => m.destinationLinks.length === 0).length
  }

  private getLastCount (): number {
    return this.model.milestones.filter((m: IMilestone): boolean => m.sourceLinks.length === 0).length
  }

  private highlightCriticalPath (): void {
    this.model.milestones.forEach(m => {
      if (m.timing.tbuf === 0) {
        m.onCriticalPath = true
      }
    })

    this.model.links.forEach(l => {
      const m1: IMilestone = this.getItemById(this.model.milestones, l.sourceId) as IMilestone
      const m2: IMilestone = this.getItemById(this.model.milestones, l.destId) as IMilestone
      if (m1.timing.tmin! + l.taskLength === m2.timing.tmax) {
        l.onCriticalPath = true
      }
    })
  }

  private updateObjectData (): void {
    this.model.milestones.forEach((m: IMilestone): void => {
      const mObj = this.obj.milestones.find((mObj: any) => mObj.id === m.id)
      mObj.name = m.name
      mObj.onCriticalPath = m.onCriticalPath
      // I cannot just do that in case I want to store more data here in the future
      // mObj.timing = m.timing
      mObj.timing.tmin = m.timing.tmin
      mObj.timing.tmax = m.timing.tmax
      mObj.timing.tbuf = m.timing.tbuf
    })

    this.model.links.forEach((l: ILink): void => {
      const lObj = this.obj.links.find((lObj: any) => lObj.id === l.id)
      lObj.onCriticalPath = l.onCriticalPath
    })
  }
}
