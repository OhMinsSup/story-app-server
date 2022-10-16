import type { AuthUserSchema } from '../../libs/get-user.decorator';

export interface QueueJobData {
  user: AuthUserSchema;
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  tags: string[];
  price: number;
  backgroundColor: string;
  externalSite: string;
}
