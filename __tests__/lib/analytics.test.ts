import { trackWidgetCreated, trackWidgetRemoved, trackAnalytics, emitFeatureFlag } from '../../lib/analytics'

// Mock the @vercel/analytics module
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}))

import { track } from '@vercel/analytics'

describe('Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackWidgetCreated', () => {
    it('should emit feature flag and track widget creation', () => {
      trackWidgetCreated('rss', 'widget-123', { 
        feed_url: 'https://example.com/feed.xml' 
      })

      expect(track).toHaveBeenCalledTimes(2)
      
      // Check feature flag emission
      expect(track).toHaveBeenCalledWith('feature_flag_emitted', expect.objectContaining({
        widget_type: 'rss',
        enabled: true,
        widget_id: 'widget-123',
        event: 'widget_created',
        feed_url: 'https://example.com/feed.xml'
      }))

      // Check widget creation tracking
      expect(track).toHaveBeenCalledWith('widget_created', expect.objectContaining({
        widget_type: 'rss',
        widget_id: 'widget-123',
        feed_url: 'https://example.com/feed.xml'
      }))
    })
  })

  describe('trackWidgetRemoved', () => {
    it('should track widget removal with properties', () => {
      trackWidgetRemoved('twitch', 'widget-456', {
        channel: 'test-channel',
        was_playing: true
      })

      expect(track).toHaveBeenCalledWith('widget_removed', expect.objectContaining({
        widget_type: 'twitch',
        widget_id: 'widget-456',
        channel: 'test-channel',
        was_playing: true
      }))
    })
  })

  describe('emitFeatureFlag', () => {
    it('should emit feature flag with correct data', () => {
      emitFeatureFlag({
        widget_type: 'map',
        enabled: true,
        widget_id: 'widget-789',
        properties: { theme: 'dark' }
      })

      expect(track).toHaveBeenCalledWith('feature_flag_emitted', expect.objectContaining({
        widget_type: 'map',
        enabled: true,
        widget_id: 'widget-789',
        theme: 'dark'
      }))
    })
  })

  describe('trackAnalytics', () => {
    it('should track analytics events with timestamp', () => {
      trackAnalytics({
        widget_type: 'notes',
        event_type: 'content_changed',
        widget_id: 'widget-001',
        properties: { content_length: 150 }
      })

      expect(track).toHaveBeenCalledWith('content_changed', expect.objectContaining({
        widget_type: 'notes',
        widget_id: 'widget-001',
        content_length: 150,
        timestamp: expect.any(Number)
      }))
    })

    it('should handle errors gracefully', () => {
      const mockTrack = track as jest.MockedFunction<typeof track>
      mockTrack.mockImplementationOnce(() => {
        throw new Error('Analytics error')
      })

      // Should not throw error
      expect(() => {
        trackAnalytics({
          widget_type: 'weather',
          event_type: 'data_loaded',
          widget_id: 'widget-002'
        })
      }).not.toThrow()
    })
  })
})