import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Node } from '@unraid/shared/graphql.model.js';

@ObjectType()
export class IPv4Address {
    @Field()
    address!: string;

    @Field()
    netmask!: string;
}

@ObjectType()
export class IPv6Address {
    @Field()
    address!: string;

    @Field()
    prefixLength!: number;
}

@ObjectType({ description: 'Network interface details' })
export class NetworkInterface extends Node {
    @Field({ description: 'Interface name' })
    name!: string;

    @Field({ description: 'MAC Address' })
    macAddress!: string;

    @Field(() => Int, { nullable: true })
    mtu!: number | null;

    @Field(() => Float, { nullable: true })
    speed!: number | null;

    @Field()
    duplex!: string;

    @Field()
    internal!: boolean;

    @Field(() => [IPv4Address])
    ipv4Addresses!: IPv4Address[];

    @Field(() => [IPv6Address])
    ipv6Addresses!: IPv6Address[];

    @Field(() => Int, { nullable: true })
    vlanId!: number | null;

    @Field()
    operstate!: string;

    @Field()
    type!: string;

    @Field()
    virtual!: boolean;
}

@ObjectType({ description: 'Network interface metrics' })
export class NetworkMetric {
    @Field({ description: 'Interface name' })
    name!: string;

    @Field(() => Float, { description: 'Bytes received' })
    bytesReceived!: number;

    @Field(() => Float, { description: 'Bytes sent' })
    bytesSent!: number;

    @Field(() => Float, { description: 'Packets received' })
    packetsReceived!: number;

    @Field(() => Float, { description: 'Packets sent' })
    packetsSent!: number;

    @Field(() => Float, { description: 'Receive errors' })
    receiveErrors!: number;

    @Field(() => Float, { description: 'Transmit errors' })
    transmitErrors!: number;

    @Field(() => Float, { description: 'Receive dropped' })
    receiveDropped!: number;

    @Field(() => Float, { description: 'Transmit dropped' })
    transmitDropped!: number;

    @Field(() => Float, { description: 'Bytes received per second' })
    rxSec!: number;

    @Field(() => Float, { description: 'Bytes transmitted per second' })
    txSec!: number;

    @Field(() => Float, { description: 'Utilization percent', nullable: true })
    utilizationPercent?: number;

    @Field(() => Date, { description: 'Last updated timestamp', nullable: true })
    lastUpdated?: Date;
}
