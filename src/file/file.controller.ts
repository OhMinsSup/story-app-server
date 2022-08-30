import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';

import { LoggedInGuard } from '../modules/auth/logged-in.guard';
import { UploadRequestDto } from './dto/upload.request.dto';
import { AuthUser, AuthUserSchema } from '../libs/get-user.decorator';

@ApiTags('파일')
@Controller('api/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드' })
  @ApiBody({
    required: true,
    type: UploadRequestDto,
    description: '파일 업로드 API',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(LoggedInGuard)
  upload(
    @AuthUser() user: AuthUserSchema,
    @Body() input: UploadRequestDto,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.upload(user, input, file);
  }
}
