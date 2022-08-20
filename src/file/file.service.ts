import { Injectable } from '@nestjs/common';
import { AuthUserSchema } from 'src/libs/get-user.decorator';
import { EXCEPTION_CODE } from '../constants/exception.code';
import { CloudinaryService } from '../modules/cloudinary/cloudinary.service';
import { UploadRequestDto } from './dto/upload.request.dto';

@Injectable()
export class FileService {
  constructor(private readonly cloudinary: CloudinaryService) {}

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
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }
}
