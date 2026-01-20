/**
 * Wireless Tools for MCP Meraki Server
 * Implements wireless-related API endpoints (SSIDs, RF profiles, Bluetooth, etc)
 */

import { getMerakiClient } from '../meraki-client.js';
import { SSID, RFProfile, BluetoothSettings } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// SSIDs
// ============================================================================

export const wirelessSsidsListTool = {
  name: 'wireless_ssids_list',
  description: 'List all SSIDs (wireless networks) configured in a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function wirelessSsidsList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const ssids = await client.get<SSID[]>(`/networks/${networkId}/wireless/ssids`);

  return formatJSON({ count: ssids.length, ssids });
}

export const wirelessSsidGetTool = {
  name: 'wireless_ssid_get',
  description: 'Get configuration for a specific SSID by number (0-14).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      number: { type: 'number', description: 'SSID number (0-14)' }
    },
    required: ['networkId', 'number']
  }
};

export async function wirelessSsidGet(networkId: string, number: number): Promise<string> {
  const client = getMerakiClient();
  const ssid = await client.get<SSID>(`/networks/${networkId}/wireless/ssids/${number}`);

  return formatJSON(ssid);
}

export const wirelessSsidUpdateTool = {
  name: 'wireless_ssid_update',
  description: 'Update SSID configuration (name, auth, encryption, bandwidth limits, etc).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      number: { type: 'number', description: 'SSID number (0-14)' },
      name: { type: 'string', description: 'SSID name' },
      enabled: { type: 'boolean', description: 'SSID enabled' },
      authMode: { type: 'string', enum: ['open', 'psk', '8021x-meraki', '8021x-radius'], description: 'Authentication mode' },
      encryptionMode: { type: 'string', enum: ['wpa', 'wep', 'wpa-eap'], description: 'Encryption mode' },
      psk: { type: 'string', description: 'Pre-shared key (for WPA-PSK)' },
      visible: { type: 'boolean', description: 'SSID visibility (broadcast)' },
      ipAssignmentMode: { type: 'string', enum: ['NAT mode', 'Bridge mode', 'Layer 3 roaming'], description: 'IP assignment mode' },
      minBitrate: { type: 'number', description: 'Minimum bitrate in Mbps' },
      bandSelection: { type: 'string', enum: ['Dual band operation', '5 GHz band only', 'Dual band operation with Band Steering'], description: 'Band selection' }
    },
    required: ['networkId', 'number']
  }
};

export async function wirelessSsidUpdate(networkId: string, number: number, updates: Partial<SSID>): Promise<string> {
  const client = getMerakiClient();
  const ssid = await client.put<SSID>(`/networks/${networkId}/wireless/ssids/${number}`, updates);

  return formatJSON(ssid);
}

// ============================================================================
// RF Profiles
// ============================================================================

export const wirelessRfProfilesListTool = {
  name: 'wireless_rf_profiles_list',
  description: 'List all RF profiles in a network. RF profiles control radio settings like power, channels, and data rates.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function wirelessRfProfilesList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const profiles = await client.get<RFProfile[]>(`/networks/${networkId}/wireless/rfProfiles`);

  return formatJSON({ count: profiles.length, profiles });
}

export const wirelessRfProfileCreateTool = {
  name: 'wireless_rf_profile_create',
  description: 'Create a new RF profile with custom radio settings.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      name: { type: 'string', description: 'RF profile name' },
      clientBalancingEnabled: { type: 'boolean', description: 'Enable client balancing' },
      minBitrateType: { type: 'string', enum: ['band', 'ssid'], description: 'Minimum bitrate type' },
      bandSelectionType: { type: 'string', enum: ['ap', 'ssid'], description: 'Band selection type' }
    },
    required: ['networkId', 'name']
  }
};

export async function wirelessRfProfileCreate(networkId: string, profileData: Partial<RFProfile>): Promise<string> {
  const client = getMerakiClient();
  const profile = await client.post<RFProfile>(`/networks/${networkId}/wireless/rfProfiles`, profileData);

  return formatJSON(profile);
}

// ============================================================================
// Bluetooth Settings
// ============================================================================

export const wirelessBluetoothGetTool = {
  name: 'wireless_bluetooth_get',
  description: 'Get Bluetooth settings for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function wirelessBluetoothGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const bluetooth = await client.get<BluetoothSettings>(`/networks/${networkId}/wireless/bluetooth/settings`);

  return formatJSON(bluetooth);
}

export const wirelessBluetoothUpdateTool = {
  name: 'wireless_bluetooth_update',
  description: 'Update Bluetooth settings for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      scanningEnabled: { type: 'boolean', description: 'Enable BLE scanning' },
      advertisingEnabled: { type: 'boolean', description: 'Enable BLE advertising' },
      uuid: { type: 'string', description: 'Beacon UUID' },
      major: { type: 'number', description: 'Beacon major number' },
      minor: { type: 'number', description: 'Beacon minor number' }
    },
    required: ['networkId']
  }
};

export async function wirelessBluetoothUpdate(networkId: string, updates: Partial<BluetoothSettings>): Promise<string> {
  const client = getMerakiClient();
  const bluetooth = await client.put<BluetoothSettings>(`/networks/${networkId}/wireless/bluetooth/settings`, updates);

  return formatJSON(bluetooth);
}

// ============================================================================
// Air Marshal
// ============================================================================

export const wirelessAirMarshalTool = {
  name: 'wireless_air_marshal',
  description: 'Get Air Marshal scan results showing rogue/interfering access points detected by the network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      timespan: { type: 'number', description: 'Timespan in seconds (max 2592000)', default: 86400 }
    },
    required: ['networkId']
  }
};

export async function wirelessAirMarshal(networkId: string, timespan = 86400): Promise<string> {
  const client = getMerakiClient();
  const results = await client.get(`/networks/${networkId}/wireless/airMarshal`, { timespan });

  return formatJSON(results);
}

// ============================================================================
// Export All Wireless Tools
// ============================================================================

export const wirelessTools = [
  wirelessSsidsListTool,
  wirelessSsidGetTool,
  wirelessSsidUpdateTool,
  wirelessRfProfilesListTool,
  wirelessRfProfileCreateTool,
  wirelessBluetoothGetTool,
  wirelessBluetoothUpdateTool,
  wirelessAirMarshalTool
];

export const wirelessHandlers = {
  wireless_ssids_list: wirelessSsidsList,
  wireless_ssid_get: wirelessSsidGet,
  wireless_ssid_update: wirelessSsidUpdate,
  wireless_rf_profiles_list: wirelessRfProfilesList,
  wireless_rf_profile_create: wirelessRfProfileCreate,
  wireless_bluetooth_get: wirelessBluetoothGet,
  wireless_bluetooth_update: wirelessBluetoothUpdate,
  wireless_air_marshal: wirelessAirMarshal
};
