# MCP Meraki Server

Complete Model Context Protocol (MCP) server for Cisco Meraki Dashboard API. This server exposes all major Meraki Dashboard API endpoints as MCP tools, enabling Claude to interact with and manage Meraki networks, devices, and configurations.

## Features

- **Complete API Coverage**: Implements 80+ tools across all major Meraki API categories
- **Rate Limiting**: Automatic rate limiting (5 req/sec per org, configurable)
- **Smart Retries**: Exponential backoff for failed requests
- **Caching**: Intelligent caching for semi-static data
- **Auto-Pagination**: Automatic handling of paginated responses
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Error Handling**: Detailed error messages with HTTP status codes

## Supported API Categories

### Core Infrastructure (Priority 1)
- **Organizations**: List, get details, inventory, licenses, API usage
- **Networks**: CRUD operations, bind/unbind templates, split/combine
- **Devices**: List, update, claim, remove, reboot, blink LEDs, LLDP/CDP

### Network Equipment (Priority 2)
- **Switch**: Port configuration, VLANs, stacks, QoS, routing
- **Wireless**: SSIDs, RF profiles, Bluetooth, Air Marshal
- **Appliance**: VLANs, firewall rules, VPN, NAT, port forwarding, traffic shaping

### Operations & Management (Priority 3)
- **Monitoring**: Uplink status, connection stats, latency, events, traffic analysis
- **Alerts**: Alert settings, webhooks, HTTP servers
- **Camera**: Quality settings, snapshots, video links, MV Sense, analytics

## Installation

### Prerequisites

- Node.js 18+ and npm
- Meraki Dashboard API key ([Get one here](https://dashboard.meraki.com/api_keys))
- Claude Desktop app or compatible MCP client

### Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd mcp-meraki
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your Meraki API key:
   ```env
   MERAKI_API_KEY=your_api_key_here
   MERAKI_BASE_URL=https://api.meraki.com/api/v1
   MERAKI_RATE_LIMIT=5
   MERAKI_TIMEOUT=30000
   DEBUG=false
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

## Configuration for Claude Desktop

Add this server to your Claude Desktop configuration file:

### macOS/Linux
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "meraki": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-meraki/dist/index.js"],
      "env": {
        "MERAKI_API_KEY": "your_api_key_here",
        "MERAKI_BASE_URL": "https://api.meraki.com/api/v1",
        "MERAKI_RATE_LIMIT": "5"
      }
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json` with the same structure.

**Important**: Use absolute paths and replace `/absolute/path/to/mcp-meraki` with your actual project path.

## Usage Examples

Once configured, you can ask Claude to interact with your Meraki infrastructure:

### Basic Examples

```
"List all my Meraki organizations"
→ Uses: organizations_list

"Show me all networks in organization 123456"
→ Uses: networks_list

"Get details for device with serial Q2HP-ABCD-EFGH"
→ Uses: devices_get

"List all switch ports on device Q2HP-ABCD-EFGH"
→ Uses: switch_ports_list
```

### Advanced Examples

```
"Create a new network called 'Branch Office' in org 123456 with wireless and appliance"
→ Uses: networks_create

"Update switch port 1 on device Q2HP-ABCD-EFGH to VLAN 10 and enable PoE"
→ Uses: switch_port_update

"Show me the firewall rules for network L_123456789"
→ Uses: appliance_firewall_l3_rules_get

"Get uplink status for all devices in network L_123456789"
→ Uses: monitoring_uplinks_status

"List all events in the last 24 hours for network L_123456789"
→ Uses: monitoring_events
```

### Network Operations

```
"Show me all SSIDs in network L_123456789"
→ Uses: wireless_ssids_list

"Update SSID 0 in network L_123456789 to use WPA2-PSK with password 'SecurePassword123'"
→ Uses: wireless_ssid_update

"Get VPN settings for network L_123456789"
→ Uses: appliance_vpn_settings_get

"Create a port forwarding rule to forward port 80 to 192.168.1.100:8080"
→ Uses: appliance_port_forwarding_rules_update
```

### Monitoring & Troubleshooting

```
"Show me connection statistics for the last hour in network L_123456789"
→ Uses: monitoring_connection_stats

"Get latency stats for network L_123456789"
→ Uses: monitoring_latency_stats

"Show me all clients connected to device Q2HP-ABCD-EFGH"
→ Uses: devices_clients

"Blink the LEDs on device Q2HP-ABCD-EFGH for 30 seconds"
→ Uses: devices_blink_leds
```

## Complete Tools List

### Organizations (8 tools)
- `organizations_list` - List all organizations
- `organizations_get` - Get organization details
- `organizations_update` - Update organization settings
- `organizations_inventory` - Get device inventory
- `organizations_licenses` - List licenses
- `organizations_license_get` - Get license details
- `organizations_api_requests` - Get API usage history
- `organizations_clone` - Clone organization

### Networks (10 tools)
- `networks_list` - List networks
- `networks_get` - Get network details
- `networks_create` - Create network
- `networks_update` - Update network
- `networks_delete` - Delete network
- `networks_bind` - Bind to template
- `networks_unbind` - Unbind from template
- `networks_split` - Split combined network
- `networks_combine` - Combine networks
- `networks_firmware_upgrades` - Get firmware settings

### Devices (11 tools)
- `devices_list` - List devices
- `devices_get` - Get device details
- `devices_update` - Update device
- `devices_claim` - Claim devices
- `devices_remove` - Remove device
- `devices_blink_leds` - Blink LEDs
- `devices_reboot` - Reboot device
- `devices_clients` - List clients
- `devices_lldp_cdp` - Get LLDP/CDP info
- `devices_loss_latency` - Get loss/latency history
- `devices_management_interface` - Get management interface

### Switch (7 tools)
- `switch_ports_list` - List switch ports
- `switch_port_get` - Get port details
- `switch_port_update` - Update port configuration
- `switch_vlans_list` - List VLANs
- `switch_vlan_create` - Create VLAN
- `switch_stacks_list` - List switch stacks
- `switch_stack_create` - Create switch stack

### Wireless (8 tools)
- `wireless_ssids_list` - List SSIDs
- `wireless_ssid_get` - Get SSID details
- `wireless_ssid_update` - Update SSID
- `wireless_rf_profiles_list` - List RF profiles
- `wireless_rf_profile_create` - Create RF profile
- `wireless_bluetooth_get` - Get Bluetooth settings
- `wireless_bluetooth_update` - Update Bluetooth settings
- `wireless_air_marshal` - Get Air Marshal results

### Appliance (11 tools)
- `appliance_vlans_list` - List VLANs
- `appliance_vlan_create` - Create VLAN
- `appliance_firewall_l3_rules_get` - Get firewall rules
- `appliance_firewall_l3_rules_update` - Update firewall rules
- `appliance_vpn_settings_get` - Get VPN settings
- `appliance_vpn_settings_update` - Update VPN settings
- `appliance_one_to_one_nat_rules_get` - Get 1:1 NAT rules
- `appliance_one_to_one_nat_rules_update` - Update 1:1 NAT rules
- `appliance_port_forwarding_rules_get` - Get port forwarding rules
- `appliance_port_forwarding_rules_update` - Update port forwarding rules
- `appliance_traffic_shaping_get` - Get traffic shaping rules

### Monitoring (7 tools)
- `monitoring_uplinks_status` - Get uplink status
- `monitoring_connection_stats` - Get connection statistics
- `monitoring_latency_stats` - Get latency statistics
- `monitoring_events` - Get event log
- `monitoring_client_health` - Get client health
- `monitoring_device_performance` - Get device performance
- `monitoring_network_traffic` - Get traffic analysis

### Alerts (7 tools)
- `alerts_settings_get` - Get alert settings
- `alerts_settings_update` - Update alert settings
- `webhooks_list` - List webhooks
- `webhook_create` - Create webhook
- `webhook_update` - Update webhook
- `webhook_delete` - Delete webhook
- `webhook_test` - Test webhook

### Camera (10 tools)
- `camera_quality_get` - Get quality settings
- `camera_quality_update` - Update quality settings
- `camera_video_settings_get` - Get video settings
- `camera_video_settings_update` - Update video settings
- `camera_snapshot` - Generate snapshot
- `camera_video_link` - Get video link
- `camera_zones_get` - Get detection zones
- `camera_sense_get` - Get MV Sense settings
- `camera_sense_update` - Update MV Sense settings
- `camera_analytics_overview` - Get analytics overview

**Total: 79 tools**

## Architecture

```
mcp-meraki/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── meraki-client.ts      # HTTP client with rate limiting
│   ├── types.ts              # TypeScript type definitions
│   ├── utils.ts              # Utilities (retry, pagination, cache)
│   └── tools/
│       ├── organizations.ts  # Organization tools
│       ├── networks.ts       # Network tools
│       ├── devices.ts        # Device tools
│       ├── switch.ts         # Switch tools
│       ├── wireless.ts       # Wireless tools
│       ├── appliance.ts      # Appliance tools
│       ├── monitoring.ts     # Monitoring tools
│       ├── alerts.ts         # Alert/webhook tools
│       └── camera.ts         # Camera tools
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env                      # Environment variables (create from .env.example)
└── README.md
```

## Development

### Scripts

```bash
# Build the project
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Run the server
npm start
```

### Adding New Tools

1. Add type definitions to `src/types.ts`
2. Create tool definition and handler in appropriate `src/tools/*.ts` file
3. Export tool and handler from the file
4. Tools are automatically registered in `src/index.ts`

### Debugging

Enable debug logging by setting `DEBUG=true` in your `.env` file or environment:

```bash
DEBUG=true npm start
```

## Rate Limiting

The server respects Meraki's API rate limits:
- Default: 5 requests per second per organization
- Configurable via `MERAKI_RATE_LIMIT` environment variable
- Automatic retry with exponential backoff on rate limit errors (429)
- Automatic retry on server errors (5xx)

## Error Handling

All errors are formatted consistently:

```json
{
  "error": true,
  "tool": "networks_get",
  "status": 404,
  "statusText": "Not Found",
  "message": "Network not found",
  "errors": ["Network L_123456789 not found"],
  "endpoint": "/networks/L_123456789"
}
```

## Security Best Practices

1. **Never commit `.env` file** - It contains your API key
2. **Use read-only API keys** when possible
3. **Restrict API key to specific organizations** in Dashboard
4. **Enable IP restrictions** on your API key if deploying to servers
5. **Rotate API keys regularly**

## Troubleshooting

### Server not appearing in Claude

1. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
2. Verify absolute path in config is correct
3. Ensure project is built: `npm run build`
4. Check Node.js version: `node --version` (requires 18+)

### Authentication errors

1. Verify API key is correct in `.env`
2. Check API key is enabled in Dashboard
3. Ensure API key has access to the organization

### Rate limiting

1. Reduce `MERAKI_RATE_LIMIT` if hitting limits
2. Check for concurrent requests
3. Review API usage: `organizations_api_requests`

## Resources

- [Meraki Dashboard API Documentation](https://developer.cisco.com/meraki/api-v1/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Get Meraki API Key](https://dashboard.meraki.com/api_keys)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Axios](https://axios-http.com/)
- [TypeScript](https://www.typescriptlang.org/)
