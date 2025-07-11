import { track } from '@vercel/analytics'

// Widget types for analytics
export type WidgetType = 'tiktok' | 'youtube' | 'trafficcam' | 'map' | 'worldtime' | 'website' | 'notes' | 'stream' | 'rss' | 'weather' | 'twitch'

// Analytics event types
export type AnalyticsEventType = 
  | 'widget_created'
  | 'widget_removed'
  | 'widget_refreshed'
  | 'widget_interacted'
  | 'feature_flag_emitted'
  | 'content_changed'
  | 'data_loaded'
  | 'error_occurred'

// Common analytics event properties
export interface AnalyticsEvent {
  widget_type: WidgetType
  event_type: AnalyticsEventType
  widget_id?: string
  properties?: Record<string, any>
}

// Feature flag properties
export interface FeatureFlag {
  widget_type: WidgetType
  enabled: boolean
  widget_id?: string
  properties?: Record<string, any>
}

/**
 * Emit a feature flag event for analytics
 * @param flag Feature flag data
 */
export function emitFeatureFlag(flag: FeatureFlag) {
  try {
    track('feature_flag_emitted', {
      widget_type: flag.widget_type,
      enabled: flag.enabled,
      widget_id: flag.widget_id,
      timestamp: Date.now(),
      ...flag.properties
    })
  } catch (error) {
    console.warn('Failed to emit feature flag:', error)
  }
}

/**
 * Track an analytics event
 * @param event Analytics event data
 */
export function trackAnalytics(event: AnalyticsEvent) {
  try {
    track(event.event_type, {
      widget_type: event.widget_type,
      widget_id: event.widget_id,
      timestamp: Date.now(),
      ...event.properties
    })
  } catch (error) {
    console.warn('Failed to track analytics event:', error)
  }
}

/**
 * Track widget creation
 * @param widgetType Type of widget created
 * @param widgetId Widget ID
 * @param properties Additional properties
 */
export function trackWidgetCreated(widgetType: WidgetType, widgetId: string, properties?: Record<string, any>) {
  // Emit feature flag for widget type
  emitFeatureFlag({
    widget_type: widgetType,
    enabled: true,
    widget_id: widgetId,
    properties: { event: 'widget_created', ...properties }
  })

  // Track widget creation event
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'widget_created',
    widget_id: widgetId,
    properties
  })
}

/**
 * Track widget removal
 * @param widgetType Type of widget removed
 * @param widgetId Widget ID
 * @param properties Additional properties
 */
export function trackWidgetRemoved(widgetType: WidgetType, widgetId: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'widget_removed',
    widget_id: widgetId,
    properties
  })
}

/**
 * Track widget refresh
 * @param widgetType Type of widget refreshed
 * @param widgetId Widget ID
 * @param properties Additional properties
 */
export function trackWidgetRefreshed(widgetType: WidgetType, widgetId: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'widget_refreshed',
    widget_id: widgetId,
    properties
  })
}

/**
 * Track widget interaction
 * @param widgetType Type of widget interacted with
 * @param widgetId Widget ID
 * @param interaction Type of interaction
 * @param properties Additional properties
 */
export function trackWidgetInteraction(widgetType: WidgetType, widgetId: string, interaction: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'widget_interacted',
    widget_id: widgetId,
    properties: { interaction, ...properties }
  })
}

/**
 * Track content change
 * @param widgetType Type of widget with content change
 * @param widgetId Widget ID
 * @param changeType Type of content change
 * @param properties Additional properties
 */
export function trackContentChanged(widgetType: WidgetType, widgetId: string, changeType: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'content_changed',
    widget_id: widgetId,
    properties: { change_type: changeType, ...properties }
  })
}

/**
 * Track data loaded
 * @param widgetType Type of widget that loaded data
 * @param widgetId Widget ID
 * @param dataSource Source of data
 * @param properties Additional properties
 */
export function trackDataLoaded(widgetType: WidgetType, widgetId: string, dataSource: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'data_loaded',
    widget_id: widgetId,
    properties: { data_source: dataSource, ...properties }
  })
}

/**
 * Track error occurred
 * @param widgetType Type of widget that had an error
 * @param widgetId Widget ID
 * @param error Error message or type
 * @param properties Additional properties
 */
export function trackError(widgetType: WidgetType, widgetId: string, error: string, properties?: Record<string, any>) {
  trackAnalytics({
    widget_type: widgetType,
    event_type: 'error_occurred',
    widget_id: widgetId,
    properties: { error, ...properties }
  })
}

/**
 * Track RSS widget specific events
 */
export const rssAnalytics = {
  feedLoaded: (widgetId: string, feedUrl: string, itemCount: number) => {
    trackDataLoaded('rss', widgetId, 'rss_feed', { feed_url: feedUrl, item_count: itemCount })
  },
  feedError: (widgetId: string, feedUrl: string, error: string) => {
    trackError('rss', widgetId, error, { feed_url: feedUrl })
  },
  itemClicked: (widgetId: string, itemUrl: string, itemTitle: string) => {
    trackWidgetInteraction('rss', widgetId, 'item_clicked', { item_url: itemUrl, item_title: itemTitle })
  },
  feedRefreshed: (widgetId: string, feedUrl: string) => {
    trackWidgetRefreshed('rss', widgetId, { feed_url: feedUrl })
  }
}

/**
 * Track Twitch widget specific events
 */
export const twitchAnalytics = {
  channelLoaded: (widgetId: string, channel: string) => {
    trackDataLoaded('twitch', widgetId, 'twitch_channel', { channel })
  },
  channelChanged: (widgetId: string, oldChannel: string, newChannel: string) => {
    trackContentChanged('twitch', widgetId, 'channel_changed', { old_channel: oldChannel, new_channel: newChannel })
  },
  playPauseToggled: (widgetId: string, isPlaying: boolean) => {
    trackWidgetInteraction('twitch', widgetId, 'play_pause_toggled', { is_playing: isPlaying })
  },
  muteToggled: (widgetId: string, isMuted: boolean) => {
    trackWidgetInteraction('twitch', widgetId, 'mute_toggled', { is_muted: isMuted })
  },
  streamOpened: (widgetId: string, channel: string) => {
    trackWidgetInteraction('twitch', widgetId, 'stream_opened_external', { channel })
  }
}

/**
 * Track Notes widget specific events
 */
export const notesAnalytics = {
  contentSaved: (widgetId: string, contentLength: number) => {
    trackContentChanged('notes', widgetId, 'content_saved', { content_length: contentLength })
  },
  contentChanged: (widgetId: string, hasUnsavedChanges: boolean) => {
    trackWidgetInteraction('notes', widgetId, 'content_changed', { has_unsaved_changes: hasUnsavedChanges })
  }
}

/**
 * Track World Time widget specific events
 */
export const worldTimeAnalytics = {
  timezoneChanged: (widgetId: string, oldTimezone: string, newTimezone: string) => {
    trackContentChanged('worldtime', widgetId, 'timezone_changed', { old_timezone: oldTimezone, new_timezone: newTimezone })
  },
  timeDataLoaded: (widgetId: string, timezone: string, dataSource: string) => {
    trackDataLoaded('worldtime', widgetId, dataSource, { timezone })
  },
  timeDataError: (widgetId: string, timezone: string, error: string) => {
    trackError('worldtime', widgetId, error, { timezone })
  }
}

/**
 * Track Map widget specific events
 */
export const mapAnalytics = {
  mapLoaded: (widgetId: string, latitude: number, longitude: number) => {
    trackDataLoaded('map', widgetId, 'geolocation', { latitude, longitude })
  },
  locationError: (widgetId: string, error: string) => {
    trackError('map', widgetId, error, { error_type: 'geolocation' })
  },
  locationCentered: (widgetId: string, latitude: number, longitude: number) => {
    trackWidgetInteraction('map', widgetId, 'location_centered', { latitude, longitude })
  },
  layerChanged: (widgetId: string, layer: string) => {
    trackWidgetInteraction('map', widgetId, 'layer_changed', { layer })
  }
}

/**
 * Track Weather widget specific events
 */
export const weatherAnalytics = {
  weatherLoaded: (widgetId: string, location: string, temperature: number) => {
    trackDataLoaded('weather', widgetId, 'weather_api', { location, temperature })
  },
  locationChanged: (widgetId: string, oldLocation: string, newLocation: string) => {
    trackContentChanged('weather', widgetId, 'location_changed', { old_location: oldLocation, new_location: newLocation })
  },
  weatherError: (widgetId: string, location: string, error: string) => {
    trackError('weather', widgetId, error, { location })
  }
}

/**
 * Track Stream widget specific events
 */
export const streamAnalytics = {
  streamLoaded: (widgetId: string, streamUrl: string, streamType: string) => {
    trackDataLoaded('stream', widgetId, 'stream_url', { stream_url: streamUrl, stream_type: streamType })
  },
  streamError: (widgetId: string, streamUrl: string, error: string) => {
    trackError('stream', widgetId, error, { stream_url: streamUrl })
  },
  qualityChanged: (widgetId: string, quality: string) => {
    trackWidgetInteraction('stream', widgetId, 'quality_changed', { quality })
  }
}

/**
 * Track Website widget specific events
 */
export const websiteAnalytics = {
  urlLoaded: (widgetId: string, url: string) => {
    trackDataLoaded('website', widgetId, 'iframe_url', { url })
  },
  urlChanged: (widgetId: string, oldUrl: string, newUrl: string) => {
    trackContentChanged('website', widgetId, 'url_changed', { old_url: oldUrl, new_url: newUrl })
  },
  urlError: (widgetId: string, url: string, error: string) => {
    trackError('website', widgetId, error, { url })
  }
}