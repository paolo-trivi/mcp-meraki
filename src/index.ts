#!/usr/bin/env node

/**
 * MCP Meraki Server
 * Complete Model Context Protocol server for Meraki Dashboard API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { initMerakiClient } from './meraki-client.js';
import { formatError, log, logError } from './utils.js';

// Import all tools
import { organizationTools, organizationHandlers } from './tools/organizations.js';
import { networkTools, networkHandlers } from './tools/networks.js';
import { deviceTools, deviceHandlers } from './tools/devices.js';
import { switchTools, switchHandlers } from './tools/switch.js';
import { wirelessTools, wirelessHandlers } from './tools/wireless.js';
import { applianceTools, applianceHandlers } from './tools/appliance.js';
import { monitoringTools, monitoringHandlers } from './tools/monitoring.js';
import { alertTools, alertHandlers } from './tools/alerts.js';
import { cameraTools, cameraHandlers } from './tools/camera.js';

// Load environment variables
dotenv.config();

// ============================================================================
// Configuration
// ============================================================================

const MERAKI_API_KEY = process.env.MERAKI_API_KEY;
const MERAKI_BASE_URL = process.env.MERAKI_BASE_URL || 'https://api.meraki.com/api/v1';
const MERAKI_TIMEOUT = parseInt(process.env.MERAKI_TIMEOUT || '30000', 10);
const MERAKI_RATE_LIMIT = parseInt(process.env.MERAKI_RATE_LIMIT || '5', 10);

if (!MERAKI_API_KEY) {
  console.error('Error: MERAKI_API_KEY environment variable is required');
  console.error('Please set it in your .env file or environment variables');
  process.exit(1);
}

// ============================================================================
// Initialize Meraki Client
// ============================================================================

initMerakiClient({
  apiKey: MERAKI_API_KEY,
  baseURL: MERAKI_BASE_URL,
  timeout: MERAKI_TIMEOUT,
  rateLimit: MERAKI_RATE_LIMIT
});

log('Meraki client initialized successfully');

// ============================================================================
// Combine All Tools and Handlers
// ============================================================================

const allTools: Tool[] = [
  ...organizationTools,
  ...networkTools,
  ...deviceTools,
  ...switchTools,
  ...wirelessTools,
  ...applianceTools,
  ...monitoringTools,
  ...alertTools,
  ...cameraTools
];

const allHandlers: Record<string, (...args: any[]) => Promise<string>> = {
  ...organizationHandlers,
  ...networkHandlers,
  ...deviceHandlers,
  ...switchHandlers,
  ...wirelessHandlers,
  ...applianceHandlers,
  ...monitoringHandlers,
  ...alertHandlers,
  ...cameraHandlers
};

log(`Registered ${allTools.length} tools across ${Object.keys(allHandlers).length} handlers`);

// ============================================================================
// Create MCP Server
// ============================================================================

const server = new Server(
  {
    name: 'mcp-meraki',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// ============================================================================
// Tool Handlers
// ============================================================================

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('ListTools request received');
  return {
    tools: allTools
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  log(`CallTool request: ${name}`, args);

  try {
    // Find the handler for this tool
    const handler = allHandlers[name];

    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Extract arguments based on tool
    let result: string;

    // Call the appropriate handler with the correct arguments
    switch (name) {
      // Organizations
      case 'organizations_list':
        result = await handler();
        break;
      case 'organizations_get':
        result = await handler(args.organizationId);
        break;
      case 'organizations_update':
        result = await handler(args.organizationId, {
          name: args.name,
          management: args.management
        });
        break;
      case 'organizations_inventory':
        result = await handler(args.organizationId, {
          perPage: args.perPage,
          usedState: args.usedState,
          search: args.search
        });
        break;
      case 'organizations_licenses':
        result = await handler(args.organizationId, {
          perPage: args.perPage,
          state: args.state
        });
        break;
      case 'organizations_license_get':
        result = await handler(args.organizationId, args.licenseId);
        break;
      case 'organizations_api_requests':
        result = await handler(args.organizationId, {
          timespan: args.timespan,
          perPage: args.perPage,
          adminId: args.adminId,
          path: args.path,
          method: args.method,
          responseCode: args.responseCode
        });
        break;
      case 'organizations_clone':
        result = await handler(args.organizationId, args.name);
        break;

      // Networks
      case 'networks_list':
        result = await handler(args.organizationId, {
          configTemplateId: args.configTemplateId,
          tags: args.tags,
          tagsFilterType: args.tagsFilterType,
          perPage: args.perPage
        });
        break;
      case 'networks_get':
        result = await handler(args.networkId);
        break;
      case 'networks_create':
        result = await handler(args.organizationId, {
          name: args.name,
          productTypes: args.productTypes,
          timeZone: args.timeZone,
          tags: args.tags,
          notes: args.notes,
          copyFromNetworkId: args.copyFromNetworkId
        });
        break;
      case 'networks_update':
        result = await handler(args.networkId, {
          name: args.name,
          timeZone: args.timeZone,
          tags: args.tags,
          notes: args.notes,
          enrollmentString: args.enrollmentString
        });
        break;
      case 'networks_delete':
        result = await handler(args.networkId);
        break;
      case 'networks_bind':
        result = await handler(args.networkId, args.configTemplateId, args.autoBind);
        break;
      case 'networks_unbind':
        result = await handler(args.networkId, args.retainConfigs);
        break;
      case 'networks_split':
        result = await handler(args.networkId);
        break;
      case 'networks_combine':
        result = await handler(args.organizationId, args.name, args.networkIds, args.enrollmentString);
        break;
      case 'networks_firmware_upgrades':
        result = await handler(args.networkId);
        break;

      // Devices
      case 'devices_list':
        result = await handler(args.networkId);
        break;
      case 'devices_get':
        result = await handler(args.serial);
        break;
      case 'devices_update':
        result = await handler(args.serial, {
          name: args.name,
          address: args.address,
          lat: args.lat,
          lng: args.lng,
          notes: args.notes,
          tags: args.tags,
          moveMapMarker: args.moveMapMarker,
          switchProfileId: args.switchProfileId,
          floorPlanId: args.floorPlanId
        });
        break;
      case 'devices_claim':
        result = await handler(args.networkId, args.serials);
        break;
      case 'devices_remove':
        result = await handler(args.networkId, args.serial);
        break;
      case 'devices_blink_leds':
        result = await handler(args.serial, {
          duration: args.duration,
          duty: args.duty,
          period: args.period
        });
        break;
      case 'devices_reboot':
        result = await handler(args.serial);
        break;
      case 'devices_clients':
        result = await handler(args.serial, args.timespan);
        break;
      case 'devices_lldp_cdp':
        result = await handler(args.serial);
        break;
      case 'devices_loss_latency':
        result = await handler(args.serial, args.ip, {
          timespan: args.timespan,
          uplink: args.uplink
        });
        break;
      case 'devices_management_interface':
        result = await handler(args.serial);
        break;

      // Switch
      case 'switch_ports_list':
        result = await handler(args.serial);
        break;
      case 'switch_port_get':
        result = await handler(args.serial, args.portId);
        break;
      case 'switch_port_update':
        result = await handler(args.serial, args.portId, {
          name: args.name,
          tags: args.tags,
          enabled: args.enabled,
          poeEnabled: args.poeEnabled,
          type: args.type,
          vlan: args.vlan,
          voiceVlan: args.voiceVlan,
          allowedVlans: args.allowedVlans,
          rstpEnabled: args.rstpEnabled,
          stpGuard: args.stpGuard,
          linkNegotiation: args.linkNegotiation
        });
        break;
      case 'switch_vlans_list':
        result = await handler(args.networkId);
        break;
      case 'switch_vlan_create':
        result = await handler(args.networkId, {
          id: args.id,
          name: args.name,
          subnet: args.subnet,
          applianceIp: args.applianceIp
        });
        break;
      case 'switch_stacks_list':
        result = await handler(args.networkId);
        break;
      case 'switch_stack_create':
        result = await handler(args.networkId, args.name, args.serials);
        break;

      // Wireless
      case 'wireless_ssids_list':
        result = await handler(args.networkId);
        break;
      case 'wireless_ssid_get':
        result = await handler(args.networkId, args.number);
        break;
      case 'wireless_ssid_update':
        result = await handler(args.networkId, args.number, {
          name: args.name,
          enabled: args.enabled,
          authMode: args.authMode,
          encryptionMode: args.encryptionMode,
          psk: args.psk,
          visible: args.visible,
          ipAssignmentMode: args.ipAssignmentMode,
          minBitrate: args.minBitrate,
          bandSelection: args.bandSelection
        });
        break;
      case 'wireless_rf_profiles_list':
        result = await handler(args.networkId);
        break;
      case 'wireless_rf_profile_create':
        result = await handler(args.networkId, {
          name: args.name,
          clientBalancingEnabled: args.clientBalancingEnabled,
          minBitrateType: args.minBitrateType,
          bandSelectionType: args.bandSelectionType
        });
        break;
      case 'wireless_bluetooth_get':
        result = await handler(args.networkId);
        break;
      case 'wireless_bluetooth_update':
        result = await handler(args.networkId, {
          scanningEnabled: args.scanningEnabled,
          advertisingEnabled: args.advertisingEnabled,
          uuid: args.uuid,
          major: args.major,
          minor: args.minor
        });
        break;
      case 'wireless_air_marshal':
        result = await handler(args.networkId, args.timespan);
        break;

      // Appliance
      case 'appliance_vlans_list':
        result = await handler(args.networkId);
        break;
      case 'appliance_vlan_create':
        result = await handler(args.networkId, {
          id: args.id,
          name: args.name,
          subnet: args.subnet,
          applianceIp: args.applianceIp
        });
        break;
      case 'appliance_firewall_l3_rules_get':
        result = await handler(args.networkId);
        break;
      case 'appliance_firewall_l3_rules_update':
        result = await handler(args.networkId, args.rules);
        break;
      case 'appliance_vpn_settings_get':
        result = await handler(args.networkId);
        break;
      case 'appliance_vpn_settings_update':
        result = await handler(args.networkId, {
          mode: args.mode,
          hubs: args.hubs,
          subnets: args.subnets
        });
        break;
      case 'appliance_one_to_one_nat_rules_get':
        result = await handler(args.networkId);
        break;
      case 'appliance_one_to_one_nat_rules_update':
        result = await handler(args.networkId, args.rules);
        break;
      case 'appliance_port_forwarding_rules_get':
        result = await handler(args.networkId);
        break;
      case 'appliance_port_forwarding_rules_update':
        result = await handler(args.networkId, args.rules);
        break;
      case 'appliance_traffic_shaping_get':
        result = await handler(args.networkId);
        break;

      // Monitoring
      case 'monitoring_uplinks_status':
        result = await handler(args.networkId);
        break;
      case 'monitoring_connection_stats':
        result = await handler(args.networkId, args.timespan);
        break;
      case 'monitoring_latency_stats':
        result = await handler(args.networkId, args.timespan);
        break;
      case 'monitoring_events':
        result = await handler(args.networkId, {
          productType: args.productType,
          includedEventTypes: args.includedEventTypes,
          excludedEventTypes: args.excludedEventTypes,
          deviceSerial: args.deviceSerial,
          clientIp: args.clientIp,
          clientMac: args.clientMac,
          perPage: args.perPage
        });
        break;
      case 'monitoring_client_health':
        result = await handler(args.networkId, args.timespan);
        break;
      case 'monitoring_device_performance':
        result = await handler(args.serial);
        break;
      case 'monitoring_network_traffic':
        result = await handler(args.networkId, args.timespan);
        break;

      // Alerts
      case 'alerts_settings_get':
        result = await handler(args.networkId);
        break;
      case 'alerts_settings_update':
        result = await handler(args.networkId, {
          defaultDestinations: args.defaultDestinations,
          alerts: args.alerts
        });
        break;
      case 'webhooks_list':
        result = await handler(args.networkId);
        break;
      case 'webhook_create':
        result = await handler(args.networkId, {
          name: args.name,
          url: args.url,
          sharedSecret: args.sharedSecret
        });
        break;
      case 'webhook_update':
        result = await handler(args.networkId, args.httpServerId, {
          name: args.name,
          url: args.url,
          sharedSecret: args.sharedSecret
        });
        break;
      case 'webhook_delete':
        result = await handler(args.networkId, args.httpServerId);
        break;
      case 'webhook_test':
        result = await handler(args.networkId, args.httpServerId);
        break;

      // Camera
      case 'camera_quality_get':
        result = await handler(args.serial);
        break;
      case 'camera_quality_update':
        result = await handler(args.serial, {
          quality: args.quality,
          resolution: args.resolution,
          motionBasedRetentionEnabled: args.motionBasedRetentionEnabled,
          audioRecordingEnabled: args.audioRecordingEnabled
        });
        break;
      case 'camera_video_settings_get':
        result = await handler(args.serial);
        break;
      case 'camera_video_settings_update':
        result = await handler(args.serial, {
          externalRtspEnabled: args.externalRtspEnabled
        });
        break;
      case 'camera_snapshot':
        result = await handler(args.serial, {
          timestamp: args.timestamp,
          fullframe: args.fullframe
        });
        break;
      case 'camera_video_link':
        result = await handler(args.serial, args.timestamp);
        break;
      case 'camera_zones_get':
        result = await handler(args.serial);
        break;
      case 'camera_sense_get':
        result = await handler(args.serial);
        break;
      case 'camera_sense_update':
        result = await handler(args.serial, {
          senseEnabled: args.senseEnabled,
          mqttBrokerId: args.mqttBrokerId
        });
        break;
      case 'camera_analytics_overview':
        result = await handler(args.serial, args.timespan);
        break;

      default:
        throw new Error(`Handler not implemented for tool: ${name}`);
    }

    log(`Tool ${name} executed successfully`);

    return {
      content: [
        {
          type: 'text' as const,
          text: result
        }
      ]
    };
  } catch (error) {
    logError(`Error executing tool ${name}`, error);

    const merakiError = formatError(error);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: true,
            tool: name,
            ...merakiError
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  log(`MCP Meraki Server running with ${allTools.length} tools`);
  log('Ready to receive requests...');
}

main().catch((error) => {
  logError('Fatal error in main', error);
  process.exit(1);
});
