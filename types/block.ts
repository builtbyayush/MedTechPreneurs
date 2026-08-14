export type BlockedUserListItem = {
  id: string;
  name: string;
  profilePhotoUrl?: string;
  blockedAt: string;
};

export type BlockRecord = {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
};

export type BlockUserResponse = {
  ok: true;
  block: BlockRecord;
  message: string;
};

export type UnblockUserResponse = {
  ok: true;
  message: string;
};

export type BlockedUsersResponse = {
  blockedUsers: BlockedUserListItem[];
};
