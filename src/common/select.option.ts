export const storiesSelect = {
  name: true,
  description: true,
  backgroundColor: true,
  externalUrl: true,
  createdAt: true,
  updatedAt: true,
  media: {
    select: {
      id: true,
      contentUrl: true,
      originUrl: true,
      type: true,
    },
  },
  storyTags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      address: true,
      profile: {
        select: {
          nickname: true,
          profileUrl: true,
          avatarSvg: true,
          defaultProfile: true,
          gender: true,
        },
      },
    },
  },
};
