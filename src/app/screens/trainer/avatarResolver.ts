export interface TrainerProfileDetails {
  avatar?: string;
  avatarUrl?: string;
  avatar_url?: string;
}

export interface TrainerProfileResponse extends TrainerProfileDetails {
  profile?: TrainerProfileDetails | null;
}

export const resolveAvatarUrlFromProfile = (profile: TrainerProfileResponse) => {
  const nestedProfile = profile?.profile;

  return (
    nestedProfile?.avatar_url ??
    nestedProfile?.avatarUrl ??
    nestedProfile?.avatar ??
    profile?.avatar_url ??
    profile?.avatarUrl ??
    profile?.avatar
  );
};
