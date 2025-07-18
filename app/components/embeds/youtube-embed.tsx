import { extractYouTubeID } from "../../utils/embed-utils"

interface YouTubeEmbedProps {
  url: string
  title: string
  onError: () => void
}

export const YouTubeEmbed = ({ url, title, onError }: YouTubeEmbedProps) => {
  const videoId = extractYouTubeID(url)
  
  if (!videoId) {
    onError()
    return null
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`}
      className="w-full h-full border-0 rounded-md"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      onError={onError}
      title={title}
    />
  )
}
