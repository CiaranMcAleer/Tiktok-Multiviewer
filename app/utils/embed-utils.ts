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

/**
 * Extract the camera title from a TrafficWatchNI viewer page.
 */
export const extractTrafficCameraTitle = (url: string): Promise<string | null> => {
  return (async () => {
    try {
      const res = await fetch(url, { credentials: "omit" });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      // The camera title is in a <header ...> element with a title attribute
      const header = doc.querySelector('header[title]');
      if (header && header.getAttribute('title')) {
        return header.getAttribute('title');
      }
      // fallback: use text content
      if (header && header.textContent) {
        return header.textContent.trim();
      }
    } catch (e) {
      // ignore and fallback
    }
    return null;
  })();
}

export const extractTrafficImageUrl = async (url: string): Promise<string | null> => {
  // Try to fetch the viewer page and extract the camera image URL from <img class="cctvImage">
  try {
    const res = await fetch(url, { credentials: "omit" });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const img = doc.querySelector("img.cctvImage") as HTMLImageElement | null;
    if (img && img.src) {
      return img.src.startsWith("http") ? img.src : new URL(img.src, url).href;
    }
  } catch (e) {
    // ignore and fallback
  }
  // Fallback: construct from cameraId (may be incorrect for some cameras)
  const cameraId = extractTrafficWatchID(url);
  return cameraId ? `https://cctv.trafficwatchni.com/${cameraId}.jpg` : null;
}
