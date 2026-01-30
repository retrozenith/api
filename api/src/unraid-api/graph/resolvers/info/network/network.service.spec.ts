import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NetworkService } from '@app/unraid-api/graph/resolvers/info/network/network.service.js';

// Mock systeminformation
vi.mock('systeminformation', () => ({
    networkInterfaces: vi.fn(),
    networkStats: vi.fn(),
}));

describe('NetworkService', () => {
    let service: NetworkService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [NetworkService],
        }).compile();

        service = module.get<NetworkService>(NetworkService);
        vi.resetAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateNetworkInterfaces', () => {
        it('should return network interfaces with correct mapping', async () => {
            const mockInterfaces = [
                {
                    iface: 'eth0',
                    ifaceName: 'Ethernet 0',
                    ip4: '192.168.1.100',
                    ip4subnet: '255.255.255.0',
                    ip6: 'fe80::1',
                    ip6subnet: '64',
                    mac: '00:00:00:00:00:00',
                    internal: false,
                    virtual: false,
                    operstate: 'up',
                    type: 'wired',
                    duplex: 'full',
                    mtu: 1500,
                    speed: 1000,
                    dhcp: true,
                    dnsSuffix: '',
                    ieee8021xAuth: '',
                    ieee8021xState: '',
                    carrierChanges: 0,
                },
            ];

            vi.mocked(networkInterfaces).mockResolvedValue(mockInterfaces as any);

            const result = await service.generateNetworkInterfaces();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'network/eth0',
                name: 'eth0',
                macAddress: '00:00:00:00:00:00',
                mtu: 1500,
                speed: 1000,
                duplex: 'full',
                internal: false,
                ipv4Addresses: [{ address: '192.168.1.100', netmask: '255.255.255.0' }],
                ipv6Addresses: [{ address: 'fe80::1', prefixLength: 64 }],
                vlanId: null,
                operstate: 'up',
                type: 'wired',
                virtual: false,
            });
        });

        it('should parse VLAN ID from interface name', async () => {
            const mockInterfaces = [
                {
                    iface: 'eth0.10',
                    ip4: '',
                    ip4subnet: '',
                    ip6: '',
                    ip6subnet: '',
                    mac: '',
                    internal: false,
                    virtual: true,
                    operstate: 'up',
                    type: 'virtual',
                    duplex: '',
                    mtu: 1500,
                    speed: 1000,
                    ifaceName: 'eth0.10',
                    dhcp: false,
                    dnsSuffix: '',
                    ieee8021xAuth: '',
                    ieee8021xState: '',
                    carrierChanges: 0,
                },
            ];

            vi.mocked(networkInterfaces).mockResolvedValue(mockInterfaces as any);

            const result = await service.generateNetworkInterfaces();

            expect(result[0].vlanId).toBe(10);
            expect(result[0].ipv4Addresses).toEqual([]);
            expect(result[0].ipv6Addresses).toEqual([]);
        });

        it('should handle empty IP info', async () => {
            const mockInterfaces = [
                {
                    iface: 'lo',
                    ifaceName: 'Loopback',
                    ip4: '',
                    ip4subnet: '',
                    ip6: '',
                    ip6subnet: '',
                    mac: '',
                    internal: true,
                    virtual: true,
                    operstate: 'unknown',
                    type: 'virtual',
                    duplex: '',
                    mtu: 65536,
                    speed: -1,
                    dhcp: false,
                    dnsSuffix: '',
                    ieee8021xAuth: '',
                    ieee8021xState: '',
                    carrierChanges: 0,
                },
            ];
            vi.mocked(networkInterfaces).mockResolvedValue(mockInterfaces as any);
            const result = await service.generateNetworkInterfaces();
            expect(result[0].ipv4Addresses).toEqual([]);
            expect(result[0].ipv6Addresses).toEqual([]);
        });
    });

    describe('generateNetworkMetricsWithUtilization', () => {
        it('should calculate utilization correctly', async () => {
            const mockInterfaces = [
                {
                    iface: 'eth0',
                    speed: 1000, // 1000 Mbps
                },
            ];
            const mockStats = [
                {
                    iface: 'eth0',
                    rx_bytes: 1000,
                    tx_bytes: 2000,
                    rx_packets: 10,
                    tx_packets: 20,
                    rx_errors: 0,
                    tx_errors: 0,
                    rx_dropped: 0,
                    tx_dropped: 0,
                    rx_sec: 12_500_000, // 100 Mbps (12.5 MB/s)
                    tx_sec: 12_500_000, // 100 Mbps
                    // Total = 200 Mbps. Utilization should be 20%.
                },
            ];

            vi.mocked(networkInterfaces).mockResolvedValue(mockInterfaces as any);
            vi.mocked(networkStats).mockResolvedValue(mockStats as any);

            const result = await service.generateNetworkMetricsWithUtilization();

            expect(result).toHaveLength(1);
            expect(result[0].utilizationPercent).toBe(20.0);
            expect(result[0].name).toBe('eth0');
        });

        it('should handle zero speed interfaces', async () => {
            const mockInterfaces = [{ iface: 'eth0', speed: 0 }];
            const mockStats = [{ iface: 'eth0', rx_sec: 1000, tx_sec: 1000 }];

            vi.mocked(networkInterfaces).mockResolvedValue(mockInterfaces as any);
            vi.mocked(networkStats).mockResolvedValue(mockStats as any);

            const result = await service.generateNetworkMetricsWithUtilization();

            expect(result[0].utilizationPercent).toBe(0);
        });
    });
});
