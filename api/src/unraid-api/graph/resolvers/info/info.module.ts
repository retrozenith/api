import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CpuModule } from '@app/unraid-api/graph/resolvers/info/cpu/cpu.module.js';
import { CpuService } from '@app/unraid-api/graph/resolvers/info/cpu/cpu.service.js';
import { DevicesResolver } from '@app/unraid-api/graph/resolvers/info/devices/devices.resolver.js';
import { DevicesService } from '@app/unraid-api/graph/resolvers/info/devices/devices.service.js';
import { DisplayService } from '@app/unraid-api/graph/resolvers/info/display/display.service.js';
import { InfoResolver } from '@app/unraid-api/graph/resolvers/info/info.resolver.js';
import { MemoryService } from '@app/unraid-api/graph/resolvers/info/memory/memory.service.js';
import { NetworkResolver } from '@app/unraid-api/graph/resolvers/info/network/network.resolver.js';
import { NetworkService } from '@app/unraid-api/graph/resolvers/info/network/network.service.js';
import { OsService } from '@app/unraid-api/graph/resolvers/info/os/os.service.js';
import { CoreVersionsResolver } from '@app/unraid-api/graph/resolvers/info/versions/core-versions.resolver.js';
import { VersionsResolver } from '@app/unraid-api/graph/resolvers/info/versions/versions.resolver.js';
import { VersionsService } from '@app/unraid-api/graph/resolvers/info/versions/versions.service.js';
import { ServicesModule } from '@app/unraid-api/graph/services/services.module.js';

@Module({
    imports: [ConfigModule, ServicesModule, CpuModule],
    providers: [
        // Main resolver
        InfoResolver,

        // Sub-resolvers
        DevicesResolver,
        VersionsResolver,
        CoreVersionsResolver,
        NetworkResolver,

        // Services
        MemoryService,
        DevicesService,
        OsService,
        VersionsService,
        DisplayService,
        NetworkService,
    ],
    exports: [
        InfoResolver,
        DevicesResolver,
        VersionsResolver,
        CoreVersionsResolver,
        DisplayService,
        NetworkService,
    ],
})
export class InfoModule {}
