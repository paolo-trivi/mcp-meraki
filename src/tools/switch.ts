/**
 * Switch Tools for MCP Meraki Server
 * Implements switch-related API endpoints (ports, VLANs, stacks, QoS, routing)
 */

import { getMerakiClient } from '../meraki-client.js';
import { SwitchPort, SwitchVlan, SwitchStack } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// Switch Ports
// ============================================================================

export const switchPortsListTool = {
  name: 'switch_ports_list',
  description: 'List all switch ports for a device with their configuration (VLANs, PoE, type, etc).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: {
        type: 'string',
        description: 'Switch serial number'
      }
    },
    required: ['serial']
  }
};

export async function switchPortsList(serial: string): Promise<string> {
  const client = getMerakiClient();
  const ports = await client.get<SwitchPort[]>(`/devices/${serial}/switch/ports`);

  return formatJSON({ count: ports.length, ports });
}

export const switchPortGetTool = {
  name: 'switch_port_get',
  description: 'Get configuration for a specific switch port.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Switch serial number' },
      portId: { type: 'string', description: 'Port number' }
    },
    required: ['serial', 'portId']
  }
};

export async function switchPortGet(serial: string, portId: string): Promise<string> {
  const client = getMerakiClient();
  const port = await client.get<SwitchPort>(`/devices/${serial}/switch/ports/${portId}`);

  return formatJSON(port);
}

export const switchPortUpdateTool = {
  name: 'switch_port_update',
  description: 'Update switch port configuration (VLAN, PoE, type, tags, etc).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      serial: { type: 'string', description: 'Switch serial number' },
      portId: { type: 'string', description: 'Port number' },
      name: { type: 'string', description: 'Port name' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Port tags' },
      enabled: { type: 'boolean', description: 'Port enabled status' },
      poeEnabled: { type: 'boolean', description: 'PoE enabled' },
      type: { type: 'string', enum: ['access', 'trunk'], description: 'Port type' },
      vlan: { type: 'number', description: 'VLAN ID (for access ports)' },
      voiceVlan: { type: 'number', description: 'Voice VLAN ID' },
      allowedVlans: { type: 'string', description: 'Allowed VLANs (for trunk ports, e.g., "1,3,5-10")' },
      rstpEnabled: { type: 'boolean', description: 'RSTP enabled' },
      stpGuard: { type: 'string', enum: ['disabled', 'root guard', 'bpdu guard', 'loop guard'], description: 'STP guard' },
      linkNegotiation: { type: 'string', description: 'Link negotiation' }
    },
    required: ['serial', 'portId']
  }
};

export async function switchPortUpdate(serial: string, portId: string, updates: Partial<SwitchPort>): Promise<string> {
  const client = getMerakiClient();
  const port = await client.put<SwitchPort>(`/devices/${serial}/switch/ports/${portId}`, updates);

  return formatJSON(port);
}

// ============================================================================
// Switch VLANs
// ============================================================================

export const switchVlansListTool = {
  name: 'switch_vlans_list',
  description: 'List all VLANs configured on a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function switchVlansList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const vlans = await client.get<SwitchVlan[]>(`/networks/${networkId}/switch/settings/vlans`);

  return formatJSON({ count: vlans.length, vlans });
}

export const switchVlanCreateTool = {
  name: 'switch_vlan_create',
  description: 'Create a new VLAN on a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      id: { type: 'number', description: 'VLAN ID' },
      name: { type: 'string', description: 'VLAN name' },
      subnet: { type: 'string', description: 'Subnet (e.g., "192.168.1.0/24")' },
      applianceIp: { type: 'string', description: 'Appliance IP address' }
    },
    required: ['networkId', 'id', 'name']
  }
};

export async function switchVlanCreate(networkId: string, vlanData: Partial<SwitchVlan>): Promise<string> {
  const client = getMerakiClient();
  const vlan = await client.post<SwitchVlan>(`/networks/${networkId}/switch/settings/vlans`, vlanData);

  return formatJSON(vlan);
}

// ============================================================================
// Switch Stacks
// ============================================================================

export const switchStacksListTool = {
  name: 'switch_stacks_list',
  description: 'List all switch stacks in a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function switchStacksList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const stacks = await client.get<SwitchStack[]>(`/networks/${networkId}/switch/stacks`);

  return formatJSON({ count: stacks.length, stacks });
}

export const switchStackCreateTool = {
  name: 'switch_stack_create',
  description: 'Create a new switch stack.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      name: { type: 'string', description: 'Stack name' },
      serials: { type: 'array', items: { type: 'string' }, description: 'Switch serials to include in stack' }
    },
    required: ['networkId', 'name', 'serials']
  }
};

export async function switchStackCreate(networkId: string, name: string, serials: string[]): Promise<string> {
  const client = getMerakiClient();
  const stack = await client.post<SwitchStack>(`/networks/${networkId}/switch/stacks`, { name, serials });

  return formatJSON(stack);
}

// ============================================================================
// Export All Switch Tools
// ============================================================================

export const switchTools = [
  switchPortsListTool,
  switchPortGetTool,
  switchPortUpdateTool,
  switchVlansListTool,
  switchVlanCreateTool,
  switchStacksListTool,
  switchStackCreateTool
];

export const switchHandlers = {
  switch_ports_list: switchPortsList,
  switch_port_get: switchPortGet,
  switch_port_update: switchPortUpdate,
  switch_vlans_list: switchVlansList,
  switch_vlan_create: switchVlanCreate,
  switch_stacks_list: switchStacksList,
  switch_stack_create: switchStackCreate
};
