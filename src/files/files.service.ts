import { Injectable } from '@nestjs/common';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadRequestDto } from './dtos/upload.request.dto';

// common
import { EXCEPTION_CODE } from 'src/exception/exception.code';

// types
import type { User } from '.prisma/client';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * - This method is used to file upload api
   * @param {UploadRequestDto} body
   * @param {Express.Multer.File} file
   * @param {User} user
   */
  async uploadFile(
    body: UploadRequestDto,
    file: Express.Multer.File,
    user: User,
  ) {
    try {
      const resourse = await this.cloudinary.uploadFile(
        file,
        user.id,
        body.storyType,
      );

      const { public_id, secure_url } = resourse;

      const media = await this.prisma.media.create({
        data: {
          originUrl: public_id,
          contentUrl: secure_url,
          type: body.storyType,
        },
      });

      return {
        ok: true,
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        result: {
          id: media.id,
          name: file.originalname,
          fileType: file.mimetype,
          storyType: body.storyType,
          path: media.contentUrl,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
