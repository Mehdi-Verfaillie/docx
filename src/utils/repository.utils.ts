export class RepositoryUtils {
  public getOwnerRepo(repository: string[]) {
    const urlParts = repository[0].split('/')
    return { owner: urlParts[3], name: urlParts[4] }
  }
}
