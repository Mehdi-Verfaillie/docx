import { Documentation } from './association.manager'

export class DataStore {
  private static instance: DataStore
  public documentations: Documentation[] = []
  public jsonConfig = ''

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }
}
