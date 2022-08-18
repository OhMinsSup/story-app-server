import { v2 } from 'cloudinary';
import { DynamicModule, Global, Module } from '@nestjs/common';

// service
import { CloudinaryService } from './cloudinary.service';

// types
import type { Cloudinary } from './cloudinary.interface';

@Module({})
@Global()
export class CloudinaryModule {
  static forRoot(options: Cloudinary): DynamicModule {
    return {
      module: CloudinaryModule,
      providers: [
        {
          provide: 'CLOUDINARY',
          useValue: (() => {
            return v2.config({
              cloud_name: options.cloudinaryCloudName,
              api_key: options.cloudinaryApiKey,
              api_secret: options.cloudinaryApiSecret,
              secure: true,
            });
          })(),
        },
        CloudinaryService,
      ],
      exports: [CloudinaryService],
    };
  }
}
