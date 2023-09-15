import { Documentation } from '../association.manager'

export class DataTransformManager {
  static sortDataByTypeAndName = (data: Documentation[]): Documentation[] => {
    const sortedData = [...data]

    return sortedData.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type.localeCompare(b.type)
    })
  }
}
