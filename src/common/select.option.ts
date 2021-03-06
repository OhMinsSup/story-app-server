export const userProfileSelect = {
  id: true,
  email: true,
  profile: {
    select: {
      nickname: true,
      profileUrl: true,
      avatarSvg: true,
      defaultProfile: true,
      canNotification: true,
      gender: true,
      bio: true,
    },
  },
};

export const userAccountSelect = {
  id: true,
  email: true,
  profile: userProfileSelect.profile,
  account: {
    select: {
      address: true,
    },
  },
};

export const userSelect = {
  id: true,
  email: true,
  password: true,
  profile: userProfileSelect.profile,
  account: {
    select: {
      address: true,
    },
  },
};

export const storiesSelect = {
  id: true,
  name: true,
  description: true,
  backgroundColor: true,
  externalUrl: true,
  salesStatus: true,
  createdAt: true,
  updatedAt: true,
  media: {
    select: {
      id: true,
      contentUrl: true,
      publidId: true,
      version: true,
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
  likes: {
    select: {
      userId: true,
    },
  },
  owner: {
    select: {
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
    },
  },
};

export const historiesSelect = {
  id: true,
  status: true,
  blockNumber: true,
  blockHash: true,
  transactionHash: true,
  createdAt: true,
};
