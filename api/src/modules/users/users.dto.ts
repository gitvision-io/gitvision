export class UserDTO {
  email?: string;
  name?: string;
  avatarUrl?: string;
  gitProviderToken?: string;
  gitProviderName?: string;
  lastSynchronize?: Date;
}

export class UserProfileDTO {
  name: string;
}
