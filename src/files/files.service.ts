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

  async list(user: User) {
    const media = await this.prisma.media.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      ok: true,
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      result: media,
    };
  }

  /**
   * - This method is used to file upload api
   * @param {UploadRequestDto} input
   * @param {Express.Multer.File} file
   * @param {User} user
   */
  async upload(input: UploadRequestDto, file: Express.Multer.File, user: User) {
    const { storyType } = input;

    const type = storyType.toUpperCase() as UploadRequestDto['storyType'];

    const resourse = await this.cloudinary.upload(file, user.id, type);

    const { public_id, secure_url, version } = resourse;

    const media = await this.prisma.media.create({
      data: {
        publidId: public_id,
        version: version.toString(),
        contentUrl: secure_url,
        type,
        ...(user && {
          userId: user.id,
        }),
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
        storyType: type,
        path: media.contentUrl,
      },
    };
  }
}
