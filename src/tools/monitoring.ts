/**
 * Monitoring Tools for MCP Meraki Server
 * Implements monitoring endpoints (uplink status, connection stats, latency, events, health)
 */

import { getMerakiClient } from '../meraki-client.js';
import { UplinkStatus, ConnectionStats, LatencyStats, DeviceEvent } from '../types.js';
import { formatJSON, autoPaginate } from '../utils.js';

// ============================================================================
// Uplink Status
// ============================================================================

export const monitoringUplinksTool = {
  name: 'monitoring_uplinks_status',
  description: 'Get uplink status for all devices in a network (WAN connectivity, IP addresses, gateways).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function monitoringUplinks(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const uplinks = await client.get<UplinkStatus[]>(`/networks/${networkId}/devices/uplinksLossAndLatency`);

  return formatJSON({ count: uplinks.length, uplinks });
}

// ============================================================================
// Connection Stats
// ============================================================================

export const monitoringConnectionStatsTool = {
  name: 'monitoring_connection_stats',
  description: 'Get connection statistics (association, authentication, DHCP, DNS success rates) for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      timespan: { type: 'number', description: 'Timespan in seconds (max 2592000)', default: 86400 }
    },
    required: ['networkId']
  }
};

export async function monitoringConnectionStats(networkId: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const stats = await client.get<ConnectionStats>(`/networks/${networkId}/wireless/connectionStats`, { timespan });

  return formatJSON(stats);
}

// ============================================================================
// Latency Stats
// ============================================================================

export const monitoringLatencyStatsTool = {
  name: 'monitoring_latency_stats',
  description: 'Get latency statistics for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      timespan: { type: 'number', description: 'Timespan in seconds (max 2592000)', default: 86400 }
    },
    required: ['networkId']
  }
};

export async function monitoringLatencyStats(networkId: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const stats = await client.get<LatencyStats>(`/networks/${networkId}/wireless/latencyStats`, { timespan });

  return formatJSON(stats);
}

// ============================================================================
// Device Events
// ============================================================================

export const monitoringEventsTool = {
  name: 'monitoring_events',
  description: 'Get event log for a network (device status changes, alerts, configuration changes, etc).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      productType: { type: 'string', description: 'Filter by product type', enum: ['appliance', 'camera', 'cellularGateway', 'sensor', 'switch', 'systemsManager', 'wireless'] },
      includedEventTypes: { type: 'array', items: { type: 'string' }, description: 'Filter by event types' },
      excludedEventTypes: { type: 'array', items: { type: 'string' }, description: 'Exclude event types' },
      deviceSerial: { type: 'string', description: 'Filter by device serial' },
      clientIp: { type: 'string', description: 'Filter by client IP' },
      clientMac: { type: 'string', description: 'Filter by client MAC' },
      perPage: { type: 'number', description: 'Results per page', default: 1000 }
    },
    required: ['networkId']
  }
};

export async function monitoringEvents(
  networkId: string,
  params: {
    productType?: string;
    includedEventTypes?: string[];
    excludedEventTypes?: string[];
    deviceSerial?: string;
    clientIp?: string;
    clientMac?: string;
    perPage?: number;
  } = {}
): Promise<string> {
  const client = getMerakiClient();

  const events = await autoPaginate<DeviceEvent>(
    async (startingAfter) => {
      const queryParams: Record<string, unknown> = {
        perPage: params.perPage || 1000,
        ...params
      };

      if (startingAfter) {
        queryParams.startingAfter = startingAfter;
      }

      const response = await client.getWithHeaders<DeviceEvent[]>(
        `/networks/${networkId}/events`,
        queryParams
      );

      return {
        data: response.data,
        linkHeader: response.headers.link
      };
    }
  );

  return formatJSON({ count: events.length, events });
}

// ============================================================================
// Client Health
// ============================================================================

export const monitoringClientHealthTool = {
  name: 'monitoring_client_health',
  description: 'Get overall client health metrics for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      timespan: { type: 'number', description: 'Timespan in seconds', default: 86400 }
    },
    required: ['networkId']
  }
};

export async function monitoringClientHealth(networkId: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const health = await client.get(`/networks/${networkId}/clients/overview`, { timespan });

  return formatJSON(health);
}

// ============================================================================
// Device Performance
// ============================================================================

export const monitoringDevicePerformanceTool = {
  name: 'monitoring_device_performance',
  description: 'Get performance metrics for a specific device.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Device serial number' }
    },
    required: ['serial']
  }
};

export async function monitoringDevicePerformance(serial: string): Promise<string> {
  const client = getMerakiClient();
  const performance = await client.get(`/devices/${serial}/clients/bandwidthUsageHistory`);

  return formatJSON(performance);
}

// ============================================================================
// Network Traffic
// ============================================================================

export const monitoringNetworkTrafficTool = {
  name: 'monitoring_network_traffic',
  description: 'Get application traffic data for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      timespan: { type: 'number', description: 'Timespan in seconds (max 2592000)', default: 86400 }
    },
    required: ['networkId']
  }
};

export async function monitoringNetworkTraffic(networkId: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const traffic = await client.get(`/networks/${networkId}/traffic`, { timespan });

  return formatJSON(traffic);
}

// ============================================================================
// Export All Monitoring Tools
// ============================================================================

export const monitoringTools = [
  monitoringUplinksTool,
  monitoringConnectionStatsTool,
  monitoringLatencyStatsTool,
  monitoringEventsTool,
  monitoringClientHealthTool,
  monitoringDevicePerformanceTool,
  monitoringNetworkTrafficTool
];

export const monitoringHandlers = {
  monitoring_uplinks_status: monitoringUplinks,
  monitoring_connection_stats: monitoringConnectionStats,
  monitoring_latency_stats: monitoringLatencyStats,
  monitoring_events: monitoringEvents,
  monitoring_client_health: monitoringClientHealth,
  monitoring_device_performance: monitoringDevicePerformance,
  monitoring_network_traffic: monitoringNetworkTraffic
};
