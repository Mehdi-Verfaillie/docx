import axios from 'axios'

export async function getGithubDoc(url: string): Promise<any> {
  try {
    const res = await axios.get(url)
    if (res.status === 200) {
      const urlFile = await axios.get(res.data.download_url)
      return urlFile.data
    }
  } catch (error) {
    return error
  }
}
