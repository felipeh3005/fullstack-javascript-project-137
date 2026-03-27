const createId = () => {
  const bytes = crypto.getRandomValues(new Uint32Array(4))

  return Array.from(bytes)
    .map(value => value.toString(16))
    .join('-')
}

export default createId
