export class UserDTO {
  email?: string;
  name?: string;
  avatarUrl?: string;
  githubId?: string;
  githubToken?: string;
  lastSynchronize?: Date;
}

export class UserProfileDTO {
  name: string;
}
