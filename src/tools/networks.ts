/**
 * Network Tools for MCP Meraki Server
 * Implements all network-related API endpoints
 */

import { getMerakiClient } from '../meraki-client.js';
import { Network, CreateNetworkRequest, UpdateNetworkRequest } from '../types.js';
import { formatJSON, autoPaginate } from '../utils.js';

// ============================================================================
// List Networks
// ============================================================================

export const networksListTool = {
  name: 'networks_list',
  description: 'List all networks in an organization. Returns network IDs, names, product types, and configuration details.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      configTemplateId: {
        type: 'string',
        description: 'Filter by configuration template ID'
      },
      tags: {
        type: 'array',
        description: 'Filter by tags',
        items: { type: 'string' }
      },
      tagsFilterType: {
        type: 'string',
        description: 'How to filter by tags',
        enum: ['withAnyTags', 'withAllTags']
      },
      perPage: {
        type: 'number',
        description: 'Number of entries per page',
        default: 1000
      }
    },
    required: ['organizationId']
  }
};

export async function networksList(
  organizationId: string,
  params: {
    configTemplateId?: string;
    tags?: string[];
    tagsFilterType?: string;
    perPage?: number;
  } = {}
): Promise<string> {
  const client = getMerakiClient();

  const networks = await autoPaginate<Network>(
    async (startingAfter) => {
      const queryParams: Record<string, unknown> = {
        perPage: params.perPage || 1000,
        ...params
      };

      if (startingAfter) {
        queryParams.startingAfter = startingAfter;
      }

      const response = await client.getWithHeaders<Network[]>(
        `/organizations/${organizationId}/networks`,
        queryParams
      );

      return {
        data: response.data,
        linkHeader: response.headers.link
      };
    }
  );

  return formatJSON({
    count: networks.length,
    networks: networks.map(net => ({
      id: net.id,
      name: net.name,
      productTypes: net.productTypes,
      timeZone: net.timeZone,
      tags: net.tags,
      url: net.url
    }))
  });
}

// ============================================================================
// Get Network
// ============================================================================

export const networksGetTool = {
  name: 'networks_get',
  description: 'Get detailed information about a specific network by ID.',
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

export async function networksGet(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const network = await client.get<Network>(`/networks/${networkId}`);

  return formatJSON(network);
}

// ============================================================================
// Create Network
// ============================================================================

export const networksCreateTool = {
  name: 'networks_create',
  description: 'Create a new network in an organization. Specify product types (wireless, appliance, switch, systemsManager, camera, cellularGateway, sensor) and configuration.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      name: {
        type: 'string',
        description: 'Network name'
      },
      productTypes: {
        type: 'array',
        description: 'Product types for the network',
        items: {
          type: 'string',
          enum: ['wireless', 'appliance', 'switch', 'systemsManager', 'camera', 'cellularGateway', 'sensor']
        }
      },
      timeZone: {
        type: 'string',
        description: 'Timezone (e.g., "America/Los_Angeles")'
      },
      tags: {
        type: 'array',
        description: 'Network tags',
        items: { type: 'string' }
      },
      notes: {
        type: 'string',
        description: 'Network notes'
      },
      copyFromNetworkId: {
        type: 'string',
        description: 'Copy configuration from another network'
      }
    },
    required: ['organizationId', 'name', 'productTypes']
  }
};

export async function networksCreate(
  organizationId: string,
  networkData: CreateNetworkRequest
): Promise<string> {
  const client = getMerakiClient();
  const network = await client.post<Network>(
    `/organizations/${organizationId}/networks`,
    networkData
  );

  return formatJSON(network);
}

// ============================================================================
// Update Network
// ============================================================================

export const networksUpdateTool = {
  name: 'networks_update',
  description: 'Update network settings such as name, timezone, tags, or notes.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      },
      name: {
        type: 'string',
        description: 'Network name'
      },
      timeZone: {
        type: 'string',
        description: 'Timezone'
      },
      tags: {
        type: 'array',
        description: 'Network tags',
        items: { type: 'string' }
      },
      notes: {
        type: 'string',
        description: 'Network notes'
      },
      enrollmentString: {
        type: 'string',
        description: 'Enrollment string for systems manager'
      }
    },
    required: ['networkId']
  }
};

export async function networksUpdate(
  networkId: string,
  updates: UpdateNetworkRequest
): Promise<string> {
  const client = getMerakiClient();
  const network = await client.put<Network>(
    `/networks/${networkId}`,
    updates
  );

  return formatJSON(network);
}

// ============================================================================
// Delete Network
// ============================================================================

export const networksDeleteTool = {
  name: 'networks_delete',
  description: 'Delete a network. This operation cannot be undone.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID to delete'
      }
    },
    required: ['networkId']
  }
};

export async function networksDelete(networkId: string): Promise<string> {
  const client = getMerakiClient();
  await client.delete(`/networks/${networkId}`);

  return formatJSON({
    success: true,
    message: `Network ${networkId} deleted successfully`
  });
}

// ============================================================================
// Bind Network to Template
// ============================================================================

export const networksBindTool = {
  name: 'networks_bind',
  description: 'Bind a network to a configuration template.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      },
      configTemplateId: {
        type: 'string',
        description: 'The configuration template ID'
      },
      autoBind: {
        type: 'boolean',
        description: 'Auto-bind devices to template'
      }
    },
    required: ['networkId', 'configTemplateId']
  }
};

export async function networksBind(
  networkId: string,
  configTemplateId: string,
  autoBind?: boolean
): Promise<string> {
  const client = getMerakiClient();
  const result = await client.post(
    `/networks/${networkId}/bind`,
    {
      configTemplateId,
      autoBind
    }
  );

  return formatJSON({
    success: true,
    message: `Network ${networkId} bound to template ${configTemplateId}`,
    result
  });
}

// ============================================================================
// Unbind Network from Template
// ============================================================================

export const networksUnbindTool = {
  name: 'networks_unbind',
  description: 'Unbind a network from a configuration template.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID'
      },
      retainConfigs: {
        type: 'boolean',
        description: 'Retain template configurations',
        default: true
      }
    },
    required: ['networkId']
  }
};

export async function networksUnbind(
  networkId: string,
  retainConfigs = true
): Promise<string> {
  const client = getMerakiClient();
  const result = await client.post(
    `/networks/${networkId}/unbind`,
    { retainConfigs }
  );

  return formatJSON({
    success: true,
    message: `Network ${networkId} unbound from template`,
    result
  });
}

// ============================================================================
// Split Network
// ============================================================================

export const networksSplitTool = {
  name: 'networks_split',
  description: 'Split a combined network into individual networks per product type.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      networkId: {
        type: 'string',
        description: 'The network ID to split'
      }
    },
    required: ['networkId']
  }
};

export async function networksSplit(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const result = await client.post<Network[]>(
    `/networks/${networkId}/split`
  );

  return formatJSON({
    success: true,
    message: `Network ${networkId} split successfully`,
    networks: result
  });
}

// ============================================================================
// Combine Networks
// ============================================================================

export const networksCombineTool = {
  name: 'networks_combine',
  description: 'Combine multiple networks into a single combined network.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      organizationId: {
        type: 'string',
        description: 'The organization ID'
      },
      name: {
        type: 'string',
        description: 'Name for the combined network'
      },
      networkIds: {
        type: 'array',
        description: 'Array of network IDs to combine',
        items: { type: 'string' }
      },
      enrollmentString: {
        type: 'string',
        description: 'Enrollment string for the combined network'
      }
    },
    required: ['organizationId', 'name', 'networkIds']
  }
};

export async function networksCombine(
  organizationId: string,
  name: string,
  networkIds: string[],
  enrollmentString?: string
): Promise<string> {
  const client = getMerakiClient();
  const result = await client.post<Network>(
    `/organizations/${organizationId}/networks/combine`,
    {
      name,
      networkIds,
      enrollmentString
    }
  );

  return formatJSON({
    success: true,
    message: 'Networks combined successfully',
    network: result
  });
}

// ============================================================================
// Get Network Firmware Upgrades
// ============================================================================

export const networksFirmwareTool = {
  name: 'networks_firmware_upgrades',
  description: 'Get firmware upgrade settings and schedules for a network.',
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

export async function networksFirmware(networkId: string): Promise<string> {
  const client = getMerakiClient();
  const firmware = await client.get(
    `/networks/${networkId}/firmwareUpgrades`
  );

  return formatJSON(firmware);
}

// ============================================================================
// Export All Network Tools
// ============================================================================

export const networkTools = [
  networksListTool,
  networksGetTool,
  networksCreateTool,
  networksUpdateTool,
  networksDeleteTool,
  networksBindTool,
  networksUnbindTool,
  networksSplitTool,
  networksCombineTool,
  networksFirmwareTool
];

export const networkHandlers = {
  networks_list: networksList,
  networks_get: networksGet,
  networks_create: networksCreate,
  networks_update: networksUpdate,
  networks_delete: networksDelete,
  networks_bind: networksBind,
  networks_unbind: networksUnbind,
  networks_split: networksSplit,
  networks_combine: networksCombine,
  networks_firmware_upgrades: networksFirmware
};
