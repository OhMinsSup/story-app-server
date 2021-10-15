export interface CloudinaryModuleOptions {
  cloudinaryApiSecret: string;
  cloudinaryApiKey: string;
  cloudinaryCloudName: string;
}

export enum StoryUploadTypeEnum {
  ETC = 'etc',
  PROFILE = 'profile',
  STORY = 'story',
}

export type StoryUploadType = keyof typeof StoryUploadTypeEnum;
