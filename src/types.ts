/**
 * TypeScript interfaces for Meraki Dashboard API
 * Complete type definitions for all API requests and responses
 */

// ============================================================================
// Common Types
// ============================================================================

export interface MerakiError {
  errors: string[];
}

export interface PaginationParams {
  perPage?: number;
  startingAfter?: string;
  endingBefore?: string;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  url: string;
  api: {
    enabled: boolean;
  };
  licensing?: {
    model: string;
  };
  cloud?: {
    region: {
      name: string;
    };
  };
}

export interface OrganizationInventory {
  mac: string;
  serial: string;
  name?: string;
  model: string;
  networkId?: string;
  orderNumber?: string;
  claimedAt?: string;
  licenseExpirationDate?: string;
  tags?: string[];
}

export interface License {
  id: string;
  licenseType: string;
  licenseKey: string;
  orderNumber: string;
  deviceSerial?: string;
  networkId?: string;
  state: string;
  seatCount?: number;
  totalDurationInDays?: number;
  durationInDays?: number;
  activationDate?: string;
  expirationDate?: string;
  claimDate?: string;
}

// ============================================================================
// Network Types
// ============================================================================

export interface Network {
  id: string;
  organizationId: string;
  name: string;
  productTypes: string[];
  timeZone: string;
  tags?: string[];
  enrollmentString?: string;
  url: string;
  notes?: string;
  isBoundToConfigTemplate?: boolean;
  configTemplateId?: string;
}

export interface CreateNetworkRequest {
  name: string;
  productTypes: string[];
  timeZone?: string;
  tags?: string[];
  notes?: string;
  copyFromNetworkId?: string;
}

export interface UpdateNetworkRequest {
  name?: string;
  timeZone?: string;
  tags?: string[];
  notes?: string;
  enrollmentString?: string;
}

// ============================================================================
// Device Types
// ============================================================================

export interface Device {
  serial: string;
  mac: string;
  name?: string;
  model: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  tags?: string[];
  networkId?: string;
  beaconIdParams?: {
    uuid: string;
    major: number;
    minor: number;
  };
  firmware?: string;
  floorPlanId?: string;
  lanIp?: string;
  url?: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  tags?: string[];
  moveMapMarker?: boolean;
  switchProfileId?: string;
  floorPlanId?: string;
}

export interface ClaimDevicesRequest {
  serials: string[];
}

// ============================================================================
// Client Types
// ============================================================================

export interface Client {
  id: string;
  mac: string;
  description?: string;
  ip?: string;
  ip6?: string;
  user?: string;
  firstSeen?: string;
  lastSeen?: string;
  manufacturer?: string;
  os?: string;
  recentDeviceSerial?: string;
  recentDeviceName?: string;
  recentDeviceMac?: string;
  ssid?: string;
  vlan?: number;
  switchport?: string;
  status?: string;
  notes?: string;
  smInstalled?: boolean;
  groupPolicy8021x?: string;
}

export interface ClientPolicy {
  devicePolicy: string;
  groupPolicyId?: string;
}

export interface ClientUsageHistory {
  sent: number;
  received: number;
  ts: string;
}

// ============================================================================
// Switch Types
// ============================================================================

export interface SwitchPort {
  portId: string;
  name?: string;
  tags?: string[];
  enabled: boolean;
  poeEnabled?: boolean;
  type: string;
  vlan?: number;
  voiceVlan?: number;
  allowedVlans?: string;
  isolationEnabled?: boolean;
  rstpEnabled?: boolean;
  stpGuard?: string;
  linkNegotiation?: string;
  portScheduleId?: string;
  udld?: string;
  accessPolicyType?: string;
  accessPolicyNumber?: number;
  macAllowList?: string[];
  stickyMacAllowList?: string[];
  stickyMacAllowListLimit?: number;
  stormControlEnabled?: boolean;
}

export interface SwitchVlan {
  id: number;
  name: string;
  subnet?: string;
  applianceIp?: string;
  groupPolicyId?: string;
  templateVlanType?: string;
  cidr?: string;
  mask?: number;
  dhcpHandling?: string;
  dhcpRelayServerIps?: string[];
  dhcpLeaseTime?: string;
  dhcpBootOptionsEnabled?: boolean;
  dhcpOptions?: Array<{
    code: string;
    type: string;
    value: string;
  }>;
}

export interface SwitchStack {
  id: string;
  name: string;
  serials: string[];
}

// ============================================================================
// Wireless Types
// ============================================================================

export interface SSID {
  number: number;
  name: string;
  enabled: boolean;
  splashPage?: string;
  ssidAdminAccessible?: boolean;
  authMode: string;
  encryptionMode?: string;
  wpaEncryptionMode?: string;
  radiusServers?: Array<{
    host: string;
    port: number;
    secret?: string;
  }>;
  radiusAccountingEnabled?: boolean;
  radiusAccountingServers?: Array<{
    host: string;
    port: number;
    secret?: string;
  }>;
  radiusAttributeForGroupPolicies?: string;
  radiusFailoverPolicy?: string;
  radiusLoadBalancingPolicy?: string;
  ipAssignmentMode: string;
  minBitrate?: number;
  bandSelection?: string;
  perClientBandwidthLimitUp?: number;
  perClientBandwidthLimitDown?: number;
  visible?: boolean;
  availableOnAllAps?: boolean;
  availabilityTags?: string[];
}

export interface RFProfile {
  id: string;
  networkId: string;
  name: string;
  clientBalancingEnabled?: boolean;
  minBitrateType?: string;
  bandSelectionType?: string;
  apBandSettings?: {
    bandOperationMode?: string;
    bandSteeringEnabled?: boolean;
  };
  twoFourGhzSettings?: {
    maxPower?: number;
    minPower?: number;
    minBitrate?: number;
    validAutoChannels?: number[];
    axEnabled?: boolean;
    rxsop?: number;
  };
  fiveGhzSettings?: {
    maxPower?: number;
    minPower?: number;
    minBitrate?: number;
    validAutoChannels?: number[];
    channelWidth?: string;
    rxsop?: number;
  };
}

export interface BluetoothSettings {
  scanningEnabled: boolean;
  advertisingEnabled: boolean;
  uuid?: string;
  majorMinorAssignmentMode?: string;
  major?: number;
  minor?: number;
}

// ============================================================================
// Appliance Types
// ============================================================================

export interface ApplianceVlan {
  id: number;
  interfaceId: string;
  name: string;
  subnet: string;
  applianceIp: string;
  groupPolicyId?: string;
  vpnNatSubnet?: string;
  dhcpHandling?: string;
  dhcpRelayServerIps?: string[];
  dhcpLeaseTime?: string;
  dhcpBootOptionsEnabled?: boolean;
  dhcpOptions?: Array<{
    code: string;
    type: string;
    value: string;
  }>;
  reservedIpRanges?: Array<{
    start: string;
    end: string;
    comment?: string;
  }>;
  dnsNameservers?: string;
  fixedIpAssignments?: Record<string, {
    ip: string;
    name?: string;
  }>;
}

export interface FirewallRule {
  comment?: string;
  policy: 'allow' | 'deny';
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  srcPort?: string;
  srcCidr?: string;
  destPort?: string;
  destCidr?: string;
  syslogEnabled?: boolean;
}

export interface VPNSettings {
  mode: string;
  hubs?: Array<{
    hubId: string;
    useDefaultRoute: boolean;
  }>;
  subnets?: Array<{
    localSubnet: string;
    useVpn: boolean;
  }>;
}

export interface OneToOneNatRule {
  name?: string;
  publicIp: string;
  lanIp: string;
  uplink?: string;
  allowedInbound?: Array<{
    protocol: 'tcp' | 'udp' | 'any';
    destinationPorts: string[];
    allowedIps?: string[];
  }>;
}

export interface PortForwardingRule {
  name?: string;
  lanIp: string;
  publicPort: string;
  localPort: string;
  protocol: 'tcp' | 'udp';
  allowedIps?: string[];
  uplink?: string;
}

export interface TrafficShapingRule {
  definitions: Array<{
    type: string;
    value: string;
  }>;
  perClientBandwidthLimits?: {
    settings: string;
    bandwidthLimits?: {
      limitUp?: number;
      limitDown?: number;
    };
  };
  dscpTagValue?: number;
  priority?: string;
}

// ============================================================================
// Camera Types
// ============================================================================

export interface CameraQuality {
  quality: string;
  resolution?: string;
}

export interface CameraVideoSettings {
  externalRtspEnabled?: boolean;
  rtspUrl?: string;
}

export interface CameraZone {
  zoneId: string;
  type: string;
  label?: string;
}

export interface CameraSense {
  senseEnabled: boolean;
  mqttBrokerId?: string;
  audioDetection?: {
    enabled: boolean;
  };
}

// ============================================================================
// Monitoring Types
// ============================================================================

export interface UplinkStatus {
  networkId: string;
  serial: string;
  model: string;
  lastReportedAt: string;
  uplinks: Array<{
    interface: string;
    status: string;
    ip?: string;
    gateway?: string;
    publicIp?: string;
    primaryDns?: string;
    secondaryDns?: string;
    ipAssignedBy?: string;
  }>;
}

export interface ConnectionStats {
  assoc: number;
  auth: number;
  dhcp: number;
  dns: number;
  success: number;
}

export interface LatencyStats {
  backgroundTraffic: {
    avgLatencyMs?: number;
    minLatencyMs?: number;
    maxLatencyMs?: number;
  };
  bestEffortTraffic?: string;
  videoTraffic?: string;
  voiceTraffic?: string;
}

export interface DeviceEvent {
  occurredAt: string;
  networkId: string;
  type: string;
  description: string;
  category: string;
  deviceSerial?: string;
  deviceName?: string;
  clientId?: string;
  clientMac?: string;
}

// ============================================================================
// Alert Types
// ============================================================================

export interface AlertSettings {
  defaultDestinations: {
    emails: string[];
    allAdmins: boolean;
    snmp: boolean;
    httpServerIds: string[];
  };
  alerts: Array<{
    type: string;
    enabled: boolean;
    alertDestinations?: {
      emails: string[];
      allAdmins: boolean;
      snmp: boolean;
      httpServerIds: string[];
    };
    filters?: {
      timeout?: number;
    };
  }>;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  sharedSecret?: string;
  networkId?: string;
  status?: string;
}

export interface HTTPServer {
  id: string;
  name: string;
  url: string;
  sharedSecret?: string;
  payloadTemplate?: {
    payloadTemplateId: string;
    name?: string;
  };
}

// ============================================================================
// Admin Types
// ============================================================================

export interface Admin {
  id: string;
  name: string;
  email: string;
  orgAccess: string;
  accountStatus?: string;
  twoFactorAuthEnabled?: boolean;
  hasApiKey?: boolean;
  lastActive?: string;
  networks?: Array<{
    id: string;
    access: string;
  }>;
  tags?: Array<{
    tag: string;
    access: string;
  }>;
}

export interface SAMLRole {
  id: string;
  role: string;
  orgAccess: string;
  networks?: Array<{
    id: string;
    access: string;
  }>;
  tags?: Array<{
    tag: string;
    access: string;
  }>;
}

// ============================================================================
// Template Types
// ============================================================================

export interface ConfigTemplate {
  id: string;
  name: string;
  productTypes: string[];
  timeZone?: string;
}

// ============================================================================
// SM (Systems Manager) Types
// ============================================================================

export interface SMDevice {
  id: string;
  name?: string;
  tags?: string[];
  serial?: string;
  wifiMac?: string;
  osName?: string;
  systemModel?: string;
  uuid?: string;
  serialNumber?: string;
  ip?: string;
}

export interface SMProfile {
  id: string;
  name: string;
  scope: string;
  tags?: string[];
}

// ============================================================================
// Insight Types
// ============================================================================

export interface InsightApplication {
  applicationId: string;
  name: string;
  thresholds?: {
    type: string;
    byNetwork?: Array<{
      networkId: string;
      goodput?: number;
      responseDuration?: number;
    }>;
  };
}

export interface MonitoredMediaServer {
  id: string;
  name: string;
  address: string;
  bestEffortMonitoringEnabled: boolean;
}

// ============================================================================
// API Usage Types
// ============================================================================

export interface APIUsage {
  ts: string;
  operationCount: number;
  sourceIp?: string;
  adminId?: string;
  method?: string;
  path?: string;
  queryString?: string;
  userAgent?: string;
  responseCode?: number;
}
