import { Injectable, Logger } from '@nestjs/common';

import { networkInterfaces, networkStats } from 'systeminformation';

import {
    NetworkInterface,
    NetworkMetric,
} from '@app/unraid-api/graph/resolvers/info/network/network.model.js';

@Injectable()
export class NetworkService {
    private readonly logger = new Logger(NetworkService.name);

    public async generateNetworkInterfaces(): Promise<NetworkInterface[]> {
        try {
            const interfaces = await networkInterfaces();
            if (!Array.isArray(interfaces)) {
                this.logger.warn('networkInterfaces returned non-array result');
                return [];
            }
            return interfaces.map((iface) => {
                // Parse VLAN ID from interface name (e.g., "eth0.10" -> 10)
                const vlanMatch = iface.iface.match(/\.(\d+)$/);
                const vlanId = vlanMatch ? parseInt(vlanMatch[1], 10) : null;

                return {
                    id: `network/${iface.iface}`,
                    name: iface.iface,
                    macAddress: iface.mac,
                    mtu: iface.mtu || null,
                    speed: iface.speed,
                    duplex: iface.duplex,
                    internal: iface.internal,
                    ipv4Addresses: iface.ip4 ? [{ address: iface.ip4, netmask: iface.ip4subnet }] : [],
                    ipv6Addresses: iface.ip6
                        ? [{ address: iface.ip6, prefixLength: parseInt(iface.ip6subnet, 10) || 64 }]
                        : [],
                    vlanId,
                    operstate: iface.operstate,
                    type: iface.type,
                    virtual: iface.virtual,
                };
            });
        } catch (error) {
            this.logger.error(
                `Error generating network interfaces: ${(error as Error).message}`,
                (error as Error).stack
            );
            return [];
        }
    }

    public async generateNetworkMetrics(): Promise<NetworkMetric[]> {
        try {
            const stats: any[] = await networkStats();
            if (!Array.isArray(stats)) {
                this.logger.warn('networkStats returned non-array result');
                return [];
            }
            return stats.map((stat) => ({
                name: stat.iface,
                bytesReceived: stat.rx_bytes,
                bytesSent: stat.tx_bytes,
                packetsReceived: stat.rx_packets || 0,
                packetsSent: stat.tx_packets || 0,
                receiveErrors: stat.rx_errors,
                transmitErrors: stat.tx_errors,
                receiveDropped: stat.rx_dropped,
                transmitDropped: stat.tx_dropped,
                rxSec: stat.rx_sec,
                txSec: stat.tx_sec,
                utilizationPercent: 0,
                lastUpdated: new Date(),
            }));
        } catch (error) {
            this.logger.error(
                `Error generating network metrics: ${(error as Error).message}`,
                (error as Error).stack
            );
            return [];
        }
    }

    public async generateNetworkMetricsWithUtilization(): Promise<NetworkMetric[]> {
        try {
            const [stats, interfaces] = await Promise.all([
                networkStats().catch((err) => {
                    this.logger.error(`networkStats failed: ${err.message}`);
                    return [];
                }) as Promise<any[]>,
                networkInterfaces().catch((err) => {
                    this.logger.error(`networkInterfaces failed: ${err.message}`);
                    return [];
                }),
            ]);

            if (!Array.isArray(stats)) {
                this.logger.warn('networkStats returned non-array result');
                return [];
            }

            // Safety check for interfaces
            const safeInterfaces = Array.isArray(interfaces) ? interfaces : [];

            const speedMap = new Map<string, number>();
            for (const iface of safeInterfaces) {
                speedMap.set(iface.iface, iface.speed || 0);
            }

            return stats.map((stat) => {
                const speedMbps = speedMap.get(stat.iface) || 0;
                let utilizationPercent = 0;

                if (speedMbps > 0) {
                    const totalBitsPerSec = (stat.rx_sec + stat.tx_sec) * 8;
                    const capacityBitsPerSec = speedMbps * 1_000_000;
                    utilizationPercent = parseFloat(
                        ((totalBitsPerSec / capacityBitsPerSec) * 100).toFixed(2)
                    );
                }

                return {
                    name: stat.iface,
                    bytesReceived: stat.rx_bytes,
                    bytesSent: stat.tx_bytes,
                    packetsReceived: stat.rx_packets || 0,
                    packetsSent: stat.tx_packets || 0,
                    receiveErrors: stat.rx_errors,
                    transmitErrors: stat.tx_errors,
                    receiveDropped: stat.rx_dropped,
                    transmitDropped: stat.tx_dropped,
                    rxSec: stat.rx_sec,
                    txSec: stat.tx_sec,
                    utilizationPercent,
                    lastUpdated: new Date(),
                };
            });
        } catch (error) {
            this.logger.error(
                `Error generating network metrics: ${(error as Error).message}`,
                (error as Error).stack
            );
            return [];
        }
    }
}
