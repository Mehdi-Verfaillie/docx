type DataType = {
  type: string
  name: string
  [key: string]: unknown
}

export class DataTransformManager {
  static sortDataByTypeAndName = (data: DataType[]): DataType[] => {
    const sortedData = [...data]

    return sortedData.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type.localeCompare(b.type)
    })
  }
}
