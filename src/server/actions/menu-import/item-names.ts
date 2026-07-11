export function createImportNameAllocator(existingNames: Iterable<string>) {
  const usedNames = new Set(
    Array.from(existingNames, name => name.trim().toLowerCase()).filter(Boolean)
  )

  return (name: string) => {
    const baseName = name.trim()
    let candidateName = baseName
    let suffix = 1

    while (usedNames.has(candidateName.toLowerCase())) {
      candidateName =
        suffix === 1 ? `${baseName} (copia)` : `${baseName} (copia ${suffix})`
      suffix += 1
    }

    usedNames.add(candidateName.toLowerCase())

    return candidateName
  }
}
