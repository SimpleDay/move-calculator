type Page = {
  page: number
  limit: number
}

export function mapLimitAndOffset(limit: number = 100, offset: number = 0): Page {
  if (offset % limit !== 0) {
    throw new Error(`offset <${offset}> must be a multiple of limit <${limit}>`)
  }
  const page = Math.floor(offset / limit) + 1
  return { page, limit: limit || 10 }
}
