/**
 * Appliance Tools for MCP Meraki Server
 * Implements appliance-related endpoints (VLANs, firewall, VPN, traffic shaping, NAT, port forwarding)
 */

import { getMerakiClient } from '../meraki-client.js';
import { ApplianceVlan, FirewallRule, VPNSettings, OneToOneNatRule, PortForwardingRule } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// Appliance VLANs
// ============================================================================

export const applianceVlansListTool = {
  name: 'appliance_vlans_list',
  description: 'List all VLANs configured on an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function applianceVlansList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const vlans = await client.get<ApplianceVlan[]>(`/networks/${networkId}/appliance/vlans`);

  return formatJSON({ count: vlans.length, vlans });
}

export const applianceVlanCreateTool = {
  name: 'appliance_vlan_create',
  description: 'Create a new VLAN on an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      id: { type: 'number', description: 'VLAN ID' },
      name: { type: 'string', description: 'VLAN name' },
      subnet: { type: 'string', description: 'Subnet (e.g., "192.168.1.0/24")' },
      applianceIp: { type: 'string', description: 'Appliance IP address' }
    },
    required: ['networkId', 'id', 'name', 'subnet', 'applianceIp']
  }
};

export async function applianceVlanCreate(networkId: string, vlanData: Partial<ApplianceVlan>): Promise<string> {
  const client = getMerakiClient();
  const vlan = await client.post<ApplianceVlan>(`/networks/${networkId}/appliance/vlans`, vlanData);

  return formatJSON(vlan);
}

// ============================================================================
// Firewall Rules
// ============================================================================

export const applianceFirewallL3RulesGetTool = {
  name: 'appliance_firewall_l3_rules_get',
  description: 'Get Layer 3 firewall rules for an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function applianceFirewallL3RulesGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const rules = await client.get(`/networks/${networkId}/appliance/firewall/l3FirewallRules`);

  return formatJSON(rules);
}

export const applianceFirewallL3RulesUpdateTool = {
  name: 'appliance_firewall_l3_rules_update',
  description: 'Update Layer 3 firewall rules. Rules are evaluated in order from top to bottom.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      rules: {
        type: 'array',
        description: 'Array of firewall rules',
        items: {
          type: 'object',
          properties: {
            comment: { type: 'string' },
            policy: { type: 'string', enum: ['allow', 'deny'] },
            protocol: { type: 'string', enum: ['tcp', 'udp', 'icmp', 'any'] },
            srcPort: { type: 'string' },
            srcCidr: { type: 'string' },
            destPort: { type: 'string' },
            destCidr: { type: 'string' },
            syslogEnabled: { type: 'boolean' }
          }
        }
      }
    },
    required: ['networkId', 'rules']
  }
};

export async function applianceFirewallL3RulesUpdate(networkId: string, rules: FirewallRule[]): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put(`/networks/${networkId}/appliance/firewall/l3FirewallRules`, { rules });

  return formatJSON(result);
}

// ============================================================================
// VPN Settings
// ============================================================================

export const applianceVpnGetTool = {
  name: 'appliance_vpn_settings_get',
  description: 'Get site-to-site VPN settings for an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function applianceVpnGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const vpn = await client.get<VPNSettings>(`/networks/${networkId}/appliance/vpn/siteToSiteVpn`);

  return formatJSON(vpn);
}

export const applianceVpnUpdateTool = {
  name: 'appliance_vpn_settings_update',
  description: 'Update site-to-site VPN settings.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      mode: { type: 'string', enum: ['none', 'spoke', 'hub'], description: 'VPN mode' },
      hubs: {
        type: 'array',
        description: 'VPN hubs (for spoke mode)',
        items: {
          type: 'object',
          properties: {
            hubId: { type: 'string' },
            useDefaultRoute: { type: 'boolean' }
          }
        }
      },
      subnets: {
        type: 'array',
        description: 'Local subnets to advertise',
        items: {
          type: 'object',
          properties: {
            localSubnet: { type: 'string' },
            useVpn: { type: 'boolean' }
          }
        }
      }
    },
    required: ['networkId', 'mode']
  }
};

export async function applianceVpnUpdate(networkId: string, vpnSettings: Partial<VPNSettings>): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put<VPNSettings>(`/networks/${networkId}/appliance/vpn/siteToSiteVpn`, vpnSettings);

  return formatJSON(result);
}

// ============================================================================
// 1:1 NAT Rules
// ============================================================================

export const applianceOneToOneNatRulesGetTool = {
  name: 'appliance_one_to_one_nat_rules_get',
  description: 'Get 1:1 NAT rules for an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function applianceOneToOneNatRulesGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const rules = await client.get(`/networks/${networkId}/appliance/firewall/oneToOneNatRules`);

  return formatJSON(rules);
}

export const applianceOneToOneNatRulesUpdateTool = {
  name: 'appliance_one_to_one_nat_rules_update',
  description: 'Update 1:1 NAT rules for port mapping public IPs to internal hosts.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      rules: {
        type: 'array',
        description: '1:1 NAT rules',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            publicIp: { type: 'string' },
            lanIp: { type: 'string' },
            uplink: { type: 'string', enum: ['internet1', 'internet2'] }
          }
        }
      }
    },
    required: ['networkId', 'rules']
  }
};

export async function applianceOneToOneNatRulesUpdate(networkId: string, rules: OneToOneNatRule[]): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put(`/networks/${networkId}/appliance/firewall/oneToOneNatRules`, { rules });

  return formatJSON(result);
}

// ============================================================================
// Port Forwarding Rules
// ============================================================================

export const appliancePortForwardingRulesGetTool = {
  name: 'appliance_port_forwarding_rules_get',
  description: 'Get port forwarding rules for an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function appliancePortForwardingRulesGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const rules = await client.get(`/networks/${networkId}/appliance/firewall/portForwardingRules`);

  return formatJSON(rules);
}

export const appliancePortForwardingRulesUpdateTool = {
  name: 'appliance_port_forwarding_rules_update',
  description: 'Update port forwarding rules to forward external ports to internal hosts.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      rules: {
        type: 'array',
        description: 'Port forwarding rules',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            lanIp: { type: 'string' },
            publicPort: { type: 'string' },
            localPort: { type: 'string' },
            protocol: { type: 'string', enum: ['tcp', 'udp'] },
            allowedIps: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    required: ['networkId', 'rules']
  }
};

export async function appliancePortForwardingRulesUpdate(networkId: string, rules: PortForwardingRule[]): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put(`/networks/${networkId}/appliance/firewall/portForwardingRules`, { rules });

  return formatJSON(result);
}

// ============================================================================
// Traffic Shaping
// ============================================================================

export const applianceTrafficShapingGetTool = {
  name: 'appliance_traffic_shaping_get',
  description: 'Get traffic shaping rules for an MX appliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function applianceTrafficShapingGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const rules = await client.get(`/networks/${networkId}/appliance/trafficShaping/rules`);

  return formatJSON(rules);
}

// ============================================================================
// Export All Appliance Tools
// ============================================================================

export const applianceTools = [
  applianceVlansListTool,
  applianceVlanCreateTool,
  applianceFirewallL3RulesGetTool,
  applianceFirewallL3RulesUpdateTool,
  applianceVpnGetTool,
  applianceVpnUpdateTool,
  applianceOneToOneNatRulesGetTool,
  applianceOneToOneNatRulesUpdateTool,
  appliancePortForwardingRulesGetTool,
  appliancePortForwardingRulesUpdateTool,
  applianceTrafficShapingGetTool
];

export const applianceHandlers = {
  appliance_vlans_list: applianceVlansList,
  appliance_vlan_create: applianceVlanCreate,
  appliance_firewall_l3_rules_get: applianceFirewallL3RulesGet,
  appliance_firewall_l3_rules_update: applianceFirewallL3RulesUpdate,
  appliance_vpn_settings_get: applianceVpnGet,
  appliance_vpn_settings_update: applianceVpnUpdate,
  appliance_one_to_one_nat_rules_get: applianceOneToOneNatRulesGet,
  appliance_one_to_one_nat_rules_update: applianceOneToOneNatRulesUpdate,
  appliance_port_forwarding_rules_get: appliancePortForwardingRulesGet,
  appliance_port_forwarding_rules_update: appliancePortForwardingRulesUpdate,
  appliance_traffic_shaping_get: applianceTrafficShapingGet
};
