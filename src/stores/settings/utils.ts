export const checkUrlAccessible = async (url: string, timeout = 3000) =>
  new Promise<boolean>((resolve) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    fetch(url, {
      signal: controller.signal,
    })
      .then((response) => resolve(response.ok))
      .catch(() => resolve(false))
      .finally(() => {
        clearTimeout(timeoutId)
      })
  })
