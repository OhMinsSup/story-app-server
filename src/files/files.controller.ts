// import {
//   Body,
//   Controller,
//   Post,
//   UploadedFile,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

// // guard
// import { LoggedInGuard } from 'src/auth/logged-in.guard';
// import { AuthUser } from 'src/auth/get-user.decorator';

// // dto
// import { UploadRequestDto } from './dtos/upload.request.dto';

// // service
// import { FilesService } from './files.service';

// // types
// import type { User } from '.prisma/client';

// @ApiTags('Files')
// @UseGuards(LoggedInGuard)
// @Controller('api/files')
// export class FilesController {
//   constructor(private filesService: FilesService) {}

//   @Post('upload')
//   @UseInterceptors(FileInterceptor('file'))
//   @ApiConsumes('multipart/form-data')
//   @ApiOperation({
//     summary: '파일 업로드',
//   })
//   @ApiBody({
//     required: true,
//     type: UploadRequestDto,
//     description: '파일 업로드 API',
//   })
//   upload(
//     @AuthUser() user: User,
//     @Body() body: UploadRequestDto,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return this.filesService.upload(body, file, user);
//   }
// }
