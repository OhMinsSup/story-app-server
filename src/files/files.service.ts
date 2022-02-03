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
   * @param {UploadRequestDto} input
   * @param {Express.Multer.File} file
   * @param {User} user
   */
  async upload(input: UploadRequestDto, file: Express.Multer.File, user: User) {
    const { storyType } = input;

    const upperStoryType =
      storyType.toUpperCase() as UploadRequestDto['storyType'];

    const resourse = await this.cloudinary.upload(
      file,
      user.id,
      upperStoryType,
    );

    const { public_id, secure_url, version } = resourse;

    const media = await this.prisma.media.create({
      data: {
        publidId: public_id,
        version: version.toString(),
        contentUrl: secure_url,
        type: upperStoryType,
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
        storyType: upperStoryType,
        path: media.contentUrl,
      },
    };
  }
}
