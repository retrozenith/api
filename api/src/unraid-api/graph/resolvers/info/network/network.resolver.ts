import { Query, Resolver } from '@nestjs/graphql';

import { AuthAction, Resource } from '@unraid/shared/graphql.model.js';
import { UsePermissions } from '@unraid/shared/use-permissions.directive.js';

import { NetworkInterface } from '@app/unraid-api/graph/resolvers/info/network/network.model.js';
import { NetworkService } from '@app/unraid-api/graph/resolvers/info/network/network.service.js';

@Resolver(() => NetworkInterface)
export class NetworkResolver {
    constructor(private readonly networkService: NetworkService) {}

    @Query(() => [NetworkInterface])
    @UsePermissions({
        action: AuthAction.READ_ANY,
        resource: Resource.INFO,
    })
    public async networkInterfaces(): Promise<NetworkInterface[]> {
        return this.networkService.generateNetworkInterfaces();
    }
}
