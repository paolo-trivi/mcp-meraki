/**
 * Alert Tools for MCP Meraki Server
 * Implements alert and webhook endpoints
 */

import { getMerakiClient } from '../meraki-client.js';
import { AlertSettings, Webhook } from '../types.js';
import { formatJSON } from '../utils.js';

// ============================================================================
// Alert Settings
// ============================================================================

export const alertsSettingsGetTool = {
  name: 'alerts_settings_get',
  description: 'Get alert settings for a network (email recipients, SNMP, webhooks).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function alertsSettingsGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const settings = await client.get<AlertSettings>(`/networks/${networkId}/alerts/settings`);

  return formatJSON(settings);
}

export const alertsSettingsUpdateTool = {
  name: 'alerts_settings_update',
  description: 'Update alert settings for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      defaultDestinations: {
        type: 'object',
        properties: {
          emails: { type: 'array', items: { type: 'string' } },
          allAdmins: { type: 'boolean' },
          snmp: { type: 'boolean' },
          httpServerIds: { type: 'array', items: { type: 'string' } }
        }
      },
      alerts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            enabled: { type: 'boolean' }
          }
        }
      }
    },
    required: ['networkId']
  }
};

export async function alertsSettingsUpdate(networkId: string, settings: Partial<AlertSettings>): Promise<string> {
  const client = getMerakiClient();
  const result = await client.put<AlertSettings>(`/networks/${networkId}/alerts/settings`, settings);

  return formatJSON(result);
}

// ============================================================================
// Webhooks
// ============================================================================

export const webhooksListTool = {
  name: 'webhooks_list',
  description: 'List all webhooks configured for a network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' }
    },
    required: ['networkId']
  }
};

export async function webhooksList(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const webhooks = await client.get<Webhook[]>(`/networks/${networkId}/webhooks/httpServers`);

  return formatJSON({ count: webhooks.length, webhooks });
}

export const webhookCreateTool = {
  name: 'webhook_create',
  description: 'Create a new webhook receiver for network alerts and events.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      name: { type: 'string', description: 'Webhook name' },
      url: { type: 'string', description: 'Webhook URL' },
      sharedSecret: { type: 'string', description: 'Shared secret for HMAC verification' }
    },
    required: ['networkId', 'name', 'url']
  }
};

export async function webhookCreate(
  networkId: string,
  webhookData: { name: string; url: string; sharedSecret?: string }
): Promise<string> {
  const client = getMerakiClient();
  const webhook = await client.post<Webhook>(`/networks/${networkId}/webhooks/httpServers`, webhookData);

  return formatJSON(webhook);
}

export const webhookUpdateTool = {
  name: 'webhook_update',
  description: 'Update an existing webhook configuration.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      httpServerId: { type: 'string', description: 'Webhook/HTTP server ID' },
      name: { type: 'string', description: 'Webhook name' },
      url: { type: 'string', description: 'Webhook URL' },
      sharedSecret: { type: 'string', description: 'Shared secret' }
    },
    required: ['networkId', 'httpServerId']
  }
};

export async function webhookUpdate(
  networkId: string,
  httpServerId: string,
  updates: Partial<Webhook>
): Promise<string> {
  const client = getMerakiClient();
  const webhook = await client.put<Webhook>(
    `/networks/${networkId}/webhooks/httpServers/${httpServerId}`,
    updates
  );

  return formatJSON(webhook);
}

export const webhookDeleteTool = {
  name: 'webhook_delete',
  description: 'Delete a webhook receiver.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      httpServerId: { type: 'string', description: 'Webhook/HTTP server ID' }
    },
    required: ['networkId', 'httpServerId']
  }
};

export async function webhookDelete(networkId: string, httpServerId: string): Promise<string> {
  const client = getMerakiClient();
  await client.delete(`/networks/${networkId}/webhooks/httpServers/${httpServerId}`);

  return formatJSON({
    success: true,
    message: `Webhook ${httpServerId} deleted successfully`
  });
}

// ============================================================================
// Webhook Test
// ============================================================================

export const webhookTestTool = {
  name: 'webhook_test',
  description: 'Send a test webhook to verify configuration.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: { type: 'string', description: 'Network ID' },
      httpServerId: { type: 'string', description: 'Webhook/HTTP server ID' }
    },
    required: ['networkId', 'httpServerId']
  }
};

export async function webhookTest(networkId: string, httpServerId: string): Promise<string> {
  const client = getMerakiClient();
  const result = await client.post(
    `/networks/${networkId}/webhooks/httpServers/${httpServerId}/webhookTests`
  );

  return formatJSON({
    success: true,
    message: 'Test webhook sent',
    result
  });
}

// ============================================================================
// Export All Alert Tools
// ============================================================================

export const alertTools = [
  alertsSettingsGetTool,
  alertsSettingsUpdateTool,
  webhooksListTool,
  webhookCreateTool,
  webhookUpdateTool,
  webhookDeleteTool,
  webhookTestTool
];

export const alertHandlers = {
  alerts_settings_get: alertsSettingsGet,
  alerts_settings_update: alertsSettingsUpdate,
  webhooks_list: webhooksList,
  webhook_create: webhookCreate,
  webhook_update: webhookUpdate,
  webhook_delete: webhookDelete,
  webhook_test: webhookTest
};
