import { UploadType } from './cloudinary.enum';

export interface CloudinaryModuleOptions {
  cloudinaryApiSecret: string;
  cloudinaryApiKey: string;
  cloudinaryCloudName: string;
}

export type StoryUploadType = keyof typeof UploadType;
