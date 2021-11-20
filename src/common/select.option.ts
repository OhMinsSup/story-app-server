export const userProfileSelect = {
  id: true,
  email: true,
  profile: {
    select: {
      nickname: true,
      profileUrl: true,
      avatarSvg: true,
      defaultProfile: true,
      gender: true,
    },
  },
};

export const storiesSelect = {
  id: true,
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
  owner: {
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

export const historiesSelect = {
  id: true,
  status: true,
  to: {
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
  from: {
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
