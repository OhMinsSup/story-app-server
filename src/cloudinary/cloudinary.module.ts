import { v2 } from 'cloudinary';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CLOUDINARY } from 'src/common/common.constants';

// service
import { CloudinaryService } from './cloudinary.service';

// types
import type { CloudinaryModuleOptions } from './cloudinary.interfaces';

@Module({})
@Global()
export class CloudinaryModule {
  static forRoot(options: CloudinaryModuleOptions): DynamicModule {
    return {
      module: CloudinaryModule,
      providers: [
        {
          provide: CLOUDINARY,
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
