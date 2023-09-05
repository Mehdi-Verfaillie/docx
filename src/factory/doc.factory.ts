import { getLocalDoc } from '../provider/local/local.documentation'
import { getGithubDoc } from '../provider/remote/github/github.documentation'

export async function getDoc(url: string, type: string): Promise<any> {
  if (type === 'local') {
    return getLocalDoc(url)
  }
  if (type === 'remote') {
    return getGithubDoc(url)
  }
}
