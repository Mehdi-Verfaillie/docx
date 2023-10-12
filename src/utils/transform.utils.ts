import { Documentation } from '../association.manager'

export class DataTransformManager {
  static sortDataByTypeAndName = (data: Documentation[]): Documentation[] => {
    const sortedData = [...data]

    return sortedData.sort((a, b) => {
      if (a.type === b.type) {
        return a.path.localeCompare(b.path)
      }
      return a.type.localeCompare(b.type)
    })
  }

  static sortObjectKeys(obj: Record<string, string[]>): Record<string, string[]> {
    const sortedMap = new Map([...Object.entries(obj)].sort())
    return Object.fromEntries(sortedMap)
  }

  static removeQueryParamsFromUrl = (url: string): string => {
    return url.split('?')[0]
  }
}
