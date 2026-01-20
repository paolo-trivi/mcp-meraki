/**
 * Camera Tools for MCP Meraki Server
 * Implements camera-related endpoints (quality, zones, snapshots, video, sense)
 */

import { getMerakiClient } from '../meraki-client.js';
import { CameraQuality, CameraVideoSettings, CameraZone, CameraSense } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// Camera Quality and Retention
// ============================================================================

export const cameraQualityGetTool = {
  name: 'camera_quality_get',
  description: 'Get video quality and retention settings for a camera.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' }
    },
    required: ['serial']
  }
};

export async function cameraQualityGet(serial: string): Promise<string> {
  const client = getMerakiClient();
  const quality = await client.get<CameraQuality>(`/devices/${serial}/camera/qualityAndRetention`);

  return formatJSON(quality);
}

export const cameraQualityUpdateTool = {
  name: 'camera_quality_update',
  description: 'Update video quality and retention settings for a camera.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      quality: { type: 'string', enum: ['Standard', 'High', 'Enhanced'], description: 'Video quality' },
      resolution: { type: 'string', description: 'Video resolution (e.g., "1280x720")' },
      motionBasedRetentionEnabled: { type: 'boolean', description: 'Enable motion-based retention' },
      audioRecordingEnabled: { type: 'boolean', description: 'Enable audio recording' }
    },
    required: ['serial']
  }
};

export async function cameraQualityUpdate(serial: string, settings: Partial<CameraQuality>): Promise<string> {
  const client = getMerakiClient();
  const quality = await client.put<CameraQuality>(`/devices/${serial}/camera/qualityAndRetention`, settings);

  return formatJSON(quality);
}

// ============================================================================
// Camera Video Settings
// ============================================================================

export const cameraVideoSettingsGetTool = {
  name: 'camera_video_settings_get',
  description: 'Get video settings for a camera (RTSP, external streaming).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' }
    },
    required: ['serial']
  }
};

export async function cameraVideoSettingsGet(serial: string): Promise<string> {
  const client = getMerakiClient();
  const settings = await client.get<CameraVideoSettings>(`/devices/${serial}/camera/video/settings`);

  return formatJSON(settings);
}

export const cameraVideoSettingsUpdateTool = {
  name: 'camera_video_settings_update',
  description: 'Update video settings for a camera.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      externalRtspEnabled: { type: 'boolean', description: 'Enable external RTSP access' }
    },
    required: ['serial']
  }
};

export async function cameraVideoSettingsUpdate(serial: string, settings: Partial<CameraVideoSettings>): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put<CameraVideoSettings>(`/devices/${serial}/camera/video/settings`, settings);

  return formatJSON(result);
}

// ============================================================================
// Camera Snapshot
// ============================================================================

export const cameraSnapshotTool = {
  name: 'camera_snapshot',
  description: 'Generate a snapshot from a camera. Returns a URL to the snapshot image.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      timestamp: { type: 'string', description: 'Timestamp for snapshot (ISO 8601 format)' },
      fullframe: { type: 'boolean', description: 'Get full frame snapshot', default: false }
    },
    required: ['serial']
  }
};

export async function cameraSnapshot(
  serial: string,
  params: { timestamp?: string; fullframe?: boolean } = {}
): Promise<string> {
  const client = getMerakiClient();
  const snapshot = await client.post(`/devices/${serial}/camera/generateSnapshot`, params);

  return formatJSON(snapshot);
}

// ============================================================================
// Camera Video Link
// ============================================================================

export const cameraVideoLinkTool = {
  name: 'camera_video_link',
  description: 'Get a link to camera video for a specific time range.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      timestamp: { type: 'string', description: 'Timestamp for video (ISO 8601 format)' }
    },
    required: ['serial', 'timestamp']
  }
};

export async function cameraVideoLink(serial: string, timestamp: string): Promise<string> {
  const client = getMerakiClient();
  const link = await client.get(`/devices/${serial}/camera/videoLink`, { timestamp });

  return formatJSON(link);
}

// ============================================================================
// Camera Zones
// ============================================================================

export const cameraZonesTool = {
  name: 'camera_zones_get',
  description: 'Get motion detection zones configured on a camera.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' }
    },
    required: ['serial']
  }
};

export async function cameraZones(serial: string): Promise<string> {
  const client = getMerakiClient();
  const zones = await client.get<CameraZone[]>(`/devices/${serial}/camera/analytics/zones`);

  return formatJSON({ count: zones.length, zones });
}

// ============================================================================
// Camera Sense (MV Sense)
// ============================================================================

export const cameraSenseGetTool = {
  name: 'camera_sense_get',
  description: 'Get MV Sense settings for a camera (object detection, analytics).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' }
    },
    required: ['serial']
  }
};

export async function cameraSenseGet(serial: string): Promise<string> {
  const client = getMerakiClient();
  const sense = await client.get<CameraSense>(`/devices/${serial}/camera/sense`);

  return formatJSON(sense);
}

export const cameraSenseUpdateTool = {
  name: 'camera_sense_update',
  description: 'Update MV Sense settings for a camera.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      senseEnabled: { type: 'boolean', description: 'Enable MV Sense' },
      mqttBrokerId: { type: 'string', description: 'MQTT broker ID for analytics data' }
    },
    required: ['serial']
  }
};

export async function cameraSenseUpdate(serial: string, settings: Partial<CameraSense>): Promise<string> {
  const client = getMerakiClient();
  const sense = await client.put<CameraSense>(`/devices/${serial}/camera/sense`, settings);

  return formatJSON(sense);
}

// ============================================================================
// Camera Analytics
// ============================================================================

export const cameraAnalyticsTool = {
  name: 'camera_analytics_overview',
  description: 'Get analytics overview for a camera (people count, zone occupancy).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Camera serial number' },
      timespan: { type: 'number', description: 'Timespan in seconds (max 2592000)', default: 86400 }
    },
    required: ['serial']
  }
};

export async function cameraAnalytics(serial: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const analytics = await client.get(`/devices/${serial}/camera/analytics/overview`, { timespan });

  return formatJSON(analytics);
}

// ============================================================================
// Export All Camera Tools
// ============================================================================

export const cameraTools = [
  cameraQualityGetTool,
  cameraQualityUpdateTool,
  cameraVideoSettingsGetTool,
  cameraVideoSettingsUpdateTool,
  cameraSnapshotTool,
  cameraVideoLinkTool,
  cameraZonesTool,
  cameraSenseGetTool,
  cameraSenseUpdateTool,
  cameraAnalyticsTool
];

export const cameraHandlers = {
  camera_quality_get: cameraQualityGet,
  camera_quality_update: cameraQualityUpdate,
  camera_video_settings_get: cameraVideoSettingsGet,
  camera_video_settings_update: cameraVideoSettingsUpdate,
  camera_snapshot: cameraSnapshot,
  camera_video_link: cameraVideoLink,
  camera_zones_get: cameraZones,
  camera_sense_get: cameraSenseGet,
  camera_sense_update: cameraSenseUpdate,
  camera_analytics_overview: cameraAnalytics
};
