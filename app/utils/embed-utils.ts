export const extractYouTubeID = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export const extractTrafficWatchID = (url: string): string | null => {
  // Extract camera ID from TrafficWatch NI URLs - look for ?id= parameter
  const match = url.match(/[?&]id=(\d+)/i)
  return match ? match[1] : null
}

export const extractTrafficImageUrl = async (url: string): Promise<string | null> => {
  try {
    const cameraId = extractTrafficWatchID(url)
    if (!cameraId) return null

    // Try to fetch the page and extract the image URL
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    const data = await response.json()

    // Look for the image URL pattern in the HTML
    const imageMatch = data.contents.match(/https:\/\/cctv\.trafficwatchni\.com\/\d+\.jpg/i)
    if (imageMatch) {
      return imageMatch[0]
    } else {
      // Fallback: construct likely image URL based on camera ID
      return `https://cctv.trafficwatchni.com/${cameraId}.jpg`
    }
  } catch (error) {
    console.error("Failed to extract TrafficWatch image URL:", error)
    // Fallback: try to construct the URL
    const cameraId = extractTrafficWatchID(url)
    return cameraId ? `https://cctv.trafficwatchni.com/${cameraId}.jpg` : null
  }
}
