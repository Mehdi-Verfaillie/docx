export interface IConfig {
  associations: { [key: string]: string[] }
}

export class Config {
  constructor() {}
  public isEverythingCorrect(config: IConfig): boolean {
    return (
      this.isTypeAssociationsCorrect(config) &&
      this.isTypeAssociationsTargetsCorrect(config) &&
      this.isTypeAssociationsDocsCorrect(config) &&
      !this.hasReverseSlash(config)
    )
  }
  public isTypeAssociationsCorrect(config: IConfig): boolean {
    if (!config.associations) {
      return false
    }

    return typeof config.associations === 'object'
  }
  public isTypeAssociationsTargetsCorrect(config: IConfig): boolean {
    return Object.keys(config.associations).every((key) => typeof key === 'string' && key !== '')
  }
  public isTypeAssociationsDocsCorrect(config: IConfig): boolean {
    return Object.values(config.associations).every(
      (value) =>
        Array.isArray(value) && value.every((item) => typeof item === 'string' && item !== '')
    )
  }
  public hasReverseSlash(config: IConfig): boolean {
    return !(
      Object.values(config.associations).every((value) =>
        value.every((item) => !item.includes('\\'))
      ) && Object.keys(config.associations).every((key) => !key.includes('\\'))
    )
  }
  public isJsonFile = (str: string): boolean => {
    try {
      JSON.parse(str)
      console.warn(true, 'isJsonFile')
      return true
    } catch (e) {
      console.warn(false, 'isJsonFile', e)
      return false
    }
  }
}
