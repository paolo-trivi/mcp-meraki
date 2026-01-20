/**
 * Device Tools for MCP Meraki Server
 * Implements all device-related API endpoints
 */

import { getMerakiClient } from '../meraki-client.js';
import { Device, UpdateDeviceRequest, Client } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// List Devices
// ============================================================================

export const devicesListTool = {
  name: 'devices_list',
  description: 'List all devices in a network. Returns device serials, models, names, and status information.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      }
    },
    required: ['networkId']
  }
};

export async function devicesList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const devices = await client.get<Device[]>(`/networks/${networkId}/devices`);

  return formatJSON({
    count: devices.length,
    devices: devices.map(dev => ({
      serial: dev.serial,
      model: dev.model,
      name: dev.name,
      mac: dev.mac,
      lanIp: dev.lanIp,
      tags: dev.tags,
      networkId: dev.networkId,
      address: dev.address,
      firmware: dev.firmware
    }))
  });
}

// ============================================================================
// Get Device
// ============================================================================

export const devicesGetTool = {
  name: 'devices_get',
  description: 'Get detailed information about a specific device by serial number.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      }
    },
    required: ['serial']
  }
};

export async function devicesGet(serial: string): Promise<string> {
  const client = getMerakiClient();
  const device = await client.get<Device>(`/devices/${serial}`);

  return formatJSON(device);
}

// ============================================================================
// Update Device
// ============================================================================

export const devicesUpdateTool = {
  name: 'devices_update',
  description: 'Update device settings such as name, address, tags, notes, or location coordinates.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      },
      name: {
        type: 'string',
        description: 'Device name'
      },
      address: {
        type: 'string',
        description: 'Physical address'
      },
      lat: {
        type: 'number',
        description: 'Latitude'
      },
      lng: {
        type: 'number',
        description: 'Longitude'
      },
      notes: {
        type: 'string',
        description: 'Device notes'
      },
      tags: {
        type: 'array',
        description: 'Device tags',
        items: { type: 'string' }
      },
      moveMapMarker: {
        type: 'boolean',
        description: 'Move map marker when updating address'
      },
      switchProfileId: {
        type: 'string',
        description: 'Switch profile ID (for switches)'
      },
      floorPlanId: {
        type: 'string',
        description: 'Floor plan ID'
      }
    },
    required: ['serial']
  }
};

export async function devicesUpdate(
  serial: string,
  updates: UpdateDeviceRequest
): Promise<string> {
  const client = getMerakiClient();
  const device = await client.put<Device>(
    `/devices/${serial}`,
    updates
  );

  return formatJSON(device);
}

// ============================================================================
// Claim Devices
// ============================================================================

export const devicesClaimTool = {
  name: 'devices_claim',
  description: 'Claim devices into a network by their serial numbers. Devices must be in the organization inventory.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      },
      serials: {
        type: 'array',
        description: 'Array of device serial numbers to claim',
        items: { type: 'string' }
      }
    },
    required: ['networkId', 'serials']
  }
};

export async function devicesClaim(
  networkId: string,
  serials: string[]
): Promise<string> {
  const client = getMerakiClient();
  await client.post(
    `/networks/${networkId}/devices/claim`,
    { serials }
  );

  return formatJSON({
    success: true,
    message: `Successfully claimed ${serials.length} device(s)`,
    serials
  });
}

// ============================================================================
// Remove Device
// ============================================================================

export const devicesRemoveTool = {
  name: 'devices_remove',
  description: 'Remove a device from a network and return it to the organization inventory.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      },
      serial: {
        type: 'string',
        description: 'Device serial number to remove'
      }
    },
    required: ['networkId', 'serial']
  }
};

export async function devicesRemove(
  networkId: string,
  serial: string
): Promise<string> {
  const client = getMerakiClient();
  await client.post(
    `/networks/${networkId}/devices/remove`,
    { serial }
  );

  return formatJSON({
    success: true,
    message: `Device ${serial} removed from network ${networkId}`
  });
}

// ============================================================================
// Blink Device LEDs
// ============================================================================

export const devicesBlinkLedsTool = {
  name: 'devices_blink_leds',
  description: 'Blink the LEDs on a device to help identify it physically. Useful for locating devices in a rack or deployment.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      },
      duration: {
        type: 'number',
        description: 'Duration in seconds (default: 20, max: 120)',
        default: 20
      },
      duty: {
        type: 'number',
        description: 'LED duty cycle percentage (default: 50)',
        default: 50
      },
      period: {
        type: 'number',
        description: 'LED blink period in milliseconds (default: 160)',
        default: 160
      }
    },
    required: ['serial']
  }
};

export async function devicesBlinkLeds(
  serial: string,
  params: {
    duration?: number;
    duty?: number;
    period?: number;
  } = {}
): Promise<string> {
  const client = getMerakiClient();
  await client.post(
    `/devices/${serial}/blinkLeds`,
    params
  );

  return formatJSON({
    success: true,
    message: `LEDs blinking on device ${serial}`,
    duration: params.duration || 20
  });
}

// ============================================================================
// Reboot Device
// ============================================================================

export const devicesRebootTool = {
  name: 'devices_reboot',
  description: 'Reboot a device remotely. Use with caution as this will cause downtime.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      }
    },
    required: ['serial']
  }
};

export async function devicesReboot(serial: string): Promise<string> {
  const client = getMerakiClient();
  await client.post(`/devices/${serial}/reboot`);

  return formatJSON({
    success: true,
    message: `Reboot initiated for device ${serial}`
  });
}

// ============================================================================
// Get Device Clients
// ============================================================================

export const devicesClientsTool = {
  name: 'devices_clients',
  description: 'List all clients that have connected to a device. Useful for troubleshooting connectivity issues.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      },
      timespan: {
        type: 'number',
        description: 'Timespan in seconds (max 2592000 = 30 days)',
        default: 86400
      }
    },
    required: ['serial']
  }
};

export async function devicesClients(
  serial: string,
  timespan = 86400
): Promise<string> {
  const client = getMerakiClient();
  const clients = await client.get<Client[]>(
    `/devices/${serial}/clients`,
    { timespan }
  );

  return formatJSON({
    count: clients.length,
    clients
  });
}

// ============================================================================
// Get Device LLDP/CDP
// ============================================================================

export const devicesLldpCdpTool = {
  name: 'devices_lldp_cdp',
  description: 'Get LLDP and CDP information for a device. Shows neighboring devices and network topology.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      }
    },
    required: ['serial']
  }
};

export async function devicesLldpCdp(serial: string): Promise<string> {
  const client = getMerakiClient();
  const lldpCdp = await client.get(`/devices/${serial}/lldpCdp`);

  return formatJSON(lldpCdp);
}

// ============================================================================
// Get Device Loss and Latency History
// ============================================================================

export const devicesLossLatencyTool = {
  name: 'devices_loss_latency',
  description: 'Get uplink loss and latency history for a device. Useful for diagnosing connectivity issues.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      },
      ip: {
        type: 'string',
        description: 'IP address to get loss/latency for'
      },
      timespan: {
        type: 'number',
        description: 'Timespan in seconds (max 31 days)',
        default: 86400
      },
      uplink: {
        type: 'string',
        description: 'Uplink interface',
        enum: ['wan1', 'wan2', 'cellular']
      }
    },
    required: ['serial', 'ip']
  }
};

export async function devicesLossLatency(
  serial: string,
  ip: string,
  params: {
    timespan?: number;
    uplink?: string;
  } = {}
): Promise<string> {
  const client = getMerakiClient();
  const history = await client.get(
    `/devices/${serial}/lossAndLatencyHistory`,
    {
      ip,
      timespan: params.timespan || 86400,
      ...params
    }
  );

  return formatJSON(history);
}

// ============================================================================
// Get Device Management Interface
// ============================================================================

export const devicesManagementInterfaceTool = {
  name: 'devices_management_interface',
  description: 'Get management interface settings for a device.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Device serial number'
      }
    },
    required: ['serial']
  }
};

export async function devicesManagementInterface(serial: string): Promise<string> {
  const client = getMerakiClient();
  const managementInterface = await client.get(
    `/devices/${serial}/managementInterface`
  );

  return formatJSON(managementInterface);
}

// ============================================================================
// Export All Device Tools
// ============================================================================

export const deviceTools = [
  devicesListTool,
  devicesGetTool,
  devicesUpdateTool,
  devicesClaimTool,
  devicesRemoveTool,
  devicesBlinkLedsTool,
  devicesRebootTool,
  devicesClientsTool,
  devicesLldpCdpTool,
  devicesLossLatencyTool,
  devicesManagementInterfaceTool
];

export const deviceHandlers = {
  devices_list: devicesList,
  devices_get: devicesGet,
  devices_update: devicesUpdate,
  devices_claim: devicesClaim,
  devices_remove: devicesRemove,
  devices_blink_leds: devicesBlinkLeds,
  devices_reboot: devicesReboot,
  devices_clients: devicesClients,
  devices_lldp_cdp: devicesLldpCdp,
  devices_loss_latency: devicesLossLatency,
  devices_management_interface: devicesManagementInterface
};
