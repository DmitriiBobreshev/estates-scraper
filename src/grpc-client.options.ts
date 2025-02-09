import { ReflectionService } from '@grpc/reflection';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['cron', 'scraplog'],
    protoPath: [
      join(__dirname, './cron/cron.proto'),
      join(__dirname, './scraplog/scraplog.proto'),
    ],
    url: `localhost:${process.env.GRPC_PORT}`,
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
};
