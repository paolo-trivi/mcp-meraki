/**
 * Organization Tools for MCP Meraki Server
 * Implements all organization-related API endpoints
 */

import { getMerakiClient } from '../meraki-client.js';
import { Organization, OrganizationInventory, License } from '../types.js';
import { formatJSON, autoPaginate } from '../utils.js';

// ============================================================================
// List Organizations
// ============================================================================

export const organizationsListTool = {
  name: 'organizations_list',
  description: 'List all organizations accessible with the provided API key. Returns organization IDs, names, and API access status.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: []
  }
};

export async function organizationsList(): Promise<string> {
  const client = getMerakiClient();
  const orgs = await client.get<Organization[]>('/organizations');

  return formatJSON({
    count: orgs.length,
    organizations: orgs.map(org => ({
      id: org.id,
      name: org.name,
      url: org.url,
      apiEnabled: org.api?.enabled,
      region: org.cloud?.region?.name
    }))
  });
}

// ============================================================================
// Get Organization Details
// ============================================================================

export const organizationsGetTool = {
  name: 'organizations_get',
  description: 'Get detailed information about a specific organization by ID, including licensing model and cloud region.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      }
    },
    required: ['organizationId']
  }
};

export async function organizationsGet(organizationId: string): Promise<string> {
  const client = getMerakiClient();
  const org = await client.get<Organization>(`/organizations/${organizationId}`);

  return formatJSON(org);
}

// ============================================================================
// Update Organization
// ============================================================================

export const organizationsUpdateTool = {
  name: 'organizations_update',
  description: 'Update organization settings such as name or management details.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      name: {
        type: 'string',
        description: 'New organization name'
      },
      management: {
        type: 'object',
        description: 'Management settings',
        properties: {
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'string' }
              }
            }
          }
        }
      }
    },
    required: ['organizationId']
  }
};

export async function organizationsUpdate(
  organizationId: string,
  updates: { name?: string; management?: unknown }
): Promise<string> {
  const client = getMerakiClient();
  const org = await client.put<Organization>(
    `/organizations/${organizationId}`,
    updates
  );

  return formatJSON(org);
}

// ============================================================================
// Get Organization Inventory
// ============================================================================

export const organizationsInventoryTool = {
  name: 'organizations_inventory',
  description: 'Get the full device inventory for an organization, including all claimed devices, their models, serials, and network assignments. Supports pagination.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      perPage: {
        type: 'number',
        description: 'Number of entries per page (max 1000)',
        default: 1000
      },
      usedState: {
        type: 'string',
        description: 'Filter by used state',
        enum: ['used', 'unused']
      },
      search: {
        type: 'string',
        description: 'Search for devices by name, serial, or MAC address'
      }
    },
    required: ['organizationId']
  }
};

export async function organizationsInventory(
  organizationId: string,
  params: {
    perPage?: number;
    usedState?: string;
    search?: string;
  } = {}
): Promise<string> {
  const client = getMerakiClient();

  const inventory = await autoPaginate<OrganizationInventory>(
    async (startingAfter) => {
      const queryParams: Record<string, unknown> = {
        perPage: params.perPage || 1000,
        ...params
      };

      if (startingAfter) {
        queryParams.startingAfter = startingAfter;
      }

      const response = await client.getWithHeaders<OrganizationInventory[]>(
        `/organizations/${organizationId}/inventory/devices`,
        queryParams
      );

      return {
        data: response.data,
        linkHeader: response.headers.link
      };
    }
  );

  return formatJSON({
    count: inventory.length,
    devices: inventory
  });
}

// ============================================================================
// Get Organization Licenses
// ============================================================================

export const organizationsLicensesTool = {
  name: 'organizations_licenses',
  description: 'List all licenses for an organization, including license types, expiration dates, and device assignments.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      perPage: {
        type: 'number',
        description: 'Number of entries per page',
        default: 1000
      },
      state: {
        type: 'string',
        description: 'Filter by license state',
        enum: ['active', 'expired', 'expiring', 'recentlyQueued', 'unused', 'unusedActive']
      }
    },
    required: ['organizationId']
  }
};

export async function organizationsLicenses(
  organizationId: string,
  params: {
    perPage?: number;
    state?: string;
  } = {}
): Promise<string> {
  const client = getMerakiClient();

  const licenses = await autoPaginate<License>(
    async (startingAfter) => {
      const queryParams: Record<string, unknown> = {
        perPage: params.perPage || 1000,
        ...params
      };

      if (startingAfter) {
        queryParams.startingAfter = startingAfter;
      }

      const response = await client.getWithHeaders<License[]>(
        `/organizations/${organizationId}/licenses`,
        queryParams
      );

      return {
        data: response.data,
        linkHeader: response.headers.link
      };
    }
  );

  return formatJSON({
    count: licenses.length,
    licenses
  });
}

// ============================================================================
// Get Organization License Details
// ============================================================================

export const organizationsLicenseGetTool = {
  name: 'organizations_license_get',
  description: 'Get detailed information about a specific license by ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      licenseId: {
        type: 'string',
        description: 'The license ID'
      }
    },
    required: ['organizationId', 'licenseId']
  }
};

export async function organizationsLicenseGet(
  organizationId: string,
  licenseId: string
): Promise<string> {
  const client = getMerakiClient();
  const license = await client.get<License>(
    `/organizations/${organizationId}/licenses/${licenseId}`
  );

  return formatJSON(license);
}

// ============================================================================
// Get Organization API Requests
// ============================================================================

export const organizationsApiRequestsTool = {
  name: 'organizations_api_requests',
  description: 'Get API usage and request history for an organization. Useful for monitoring API consumption and debugging.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      timespan: {
        type: 'number',
        description: 'Timespan in seconds (max 31 days)',
        default: 86400
      },
      perPage: {
        type: 'number',
        description: 'Number of entries per page',
        default: 1000
      },
      adminId: {
        type: 'string',
        description: 'Filter by admin ID'
      },
      path: {
        type: 'string',
        description: 'Filter by API path'
      },
      method: {
        type: 'string',
        description: 'Filter by HTTP method',
        enum: ['GET', 'POST', 'PUT', 'DELETE']
      },
      responseCode: {
        type: 'number',
        description: 'Filter by response code'
      }
    },
    required: ['organizationId']
  }
};

export async function organizationsApiRequests(
  organizationId: string,
  params: {
    timespan?: number;
    perPage?: number;
    adminId?: string;
    path?: string;
    method?: string;
    responseCode?: number;
  } = {}
): Promise<string> {
  const client = getMerakiClient();

  const requests = await autoPaginate(
    async (startingAfter) => {
      const queryParams: Record<string, unknown> = {
        timespan: params.timespan || 86400,
        perPage: params.perPage || 1000,
        ...params
      };

      if (startingAfter) {
        queryParams.startingAfter = startingAfter;
      }

      const response = await client.getWithHeaders(
        `/organizations/${organizationId}/apiRequests`,
        queryParams
      );

      return {
        data: response.data as unknown[],
        linkHeader: response.headers.link
      };
    }
  );

  return formatJSON({
    count: requests.length,
    requests
  });
}

// ============================================================================
// Clone Organization
// ============================================================================

export const organizationsCloneTool = {
  name: 'organizations_clone',
  description: 'Clone an organization to a new organization. Useful for creating staging or test environments.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID to clone'
      },
      name: {
        type: 'string',
        description: 'Name for the new organization'
      }
    },
    required: ['organizationId', 'name']
  }
};

export async function organizationsClone(
  organizationId: string,
  name: string
): Promise<string> {
  const client = getMerakiClient();
  const newOrg = await client.post<Organization>(
    `/organizations/${organizationId}/clone`,
    { name }
  );

  return formatJSON(newOrg);
}

// ============================================================================
// Export All Organization Tools
// ============================================================================

export const organizationTools = [
  organizationsListTool,
  organizationsGetTool,
  organizationsUpdateTool,
  organizationsInventoryTool,
  organizationsLicensesTool,
  organizationsLicenseGetTool,
  organizationsApiRequestsTool,
  organizationsCloneTool
];

export const organizationHandlers = {
  organizations_list: organizationsList,
  organizations_get: organizationsGet,
  organizations_update: organizationsUpdate,
  organizations_inventory: organizationsInventory,
  organizations_licenses: organizationsLicenses,
  organizations_license_get: organizationsLicenseGet,
  organizations_api_requests: organizationsApiRequests,
  organizations_clone: organizationsClone
};
