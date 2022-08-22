import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthUserSchema } from '../libs/get-user.decorator';

import { EXCEPTION_CODE } from '../constants/exception.code';

import { CloudinaryService } from '../modules/cloudinary/cloudinary.service';
import { PrismaService } from '../database/prisma.service';

import { UploadRequestDto } from './dto/upload.request.dto';

import type { UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * @description 파일 업로드
   * @param {AuthUserSchema} user
   * @param {UploadRequestDto} input
   * @param {Express.Multer.File} file
   */
  async upload(
    user: AuthUserSchema,
    input: UploadRequestDto,
    file: Express.Multer.File,
  ) {
    let resp: UploadApiResponse | null = null;
    switch (input.mediaType) {
      case 'IMAGE':
        resp = await this.cloudinary.itemImageUpload({
          file,
          uploadType: input.uploadType,
          userId: user.id,
        });
        break;
      case 'VIDEO':
        resp = await this.cloudinary.itemVideoUpload({
          file,
          uploadType: input.uploadType,
          userId: user.id,
        });
        break;
      case 'MODEL':
        resp = await this.cloudinary.item3DModelUpload({
          file,
          uploadType: input.uploadType,
          userId: user.id,
        });
        break;
      default:
        throw new BadRequestException({
          status: 404,
          message: ['잘못된 타입입니다.'],
          error: 'Invalid mediaType',
        });
    }

    if (!resp) {
      throw new InternalServerErrorException({
        status: 500,
        message: ['업로드 정보가 없습니다.'],
        error: 'Empty Data Uploaded Response',
      });
    }

    const data = await this.prisma.file.create({
      data: {
        publicId: resp.public_id,
        version: resp.version,
        signature: resp.signature,
        foramt: resp.format,
        resourceType: resp.resource_type,
        url: resp.url,
        secureUrl: resp.secure_url,
        uploadType: input.uploadType,
        mediaType: input.mediaType,
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        id: data.id,
        publicId: resp.public_id,
        secureUrl: resp.secure_url,
        mediaType: input.mediaType,
      },
    };
  }
}
