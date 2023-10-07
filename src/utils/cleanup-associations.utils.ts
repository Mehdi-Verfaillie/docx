export function cleanupAssociations(associations: { [key: string]: string[] }): {
  [key: string]: string[]
} {
  const cleanedAssociations: { [key: string]: string[] } = {}

  for (const key in associations) {
    if (Object.prototype.hasOwnProperty.call(associations, key) && associations[key].length > 0) {
      cleanedAssociations[key] = associations[key]
    }
  }

  return cleanedAssociations
}
