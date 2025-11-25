import { resolveAvatarUrlFromProfile, TrainerProfileResponse } from '../src/app/screens/trainer/avatarResolver';

describe('resolveAvatarUrlFromProfile', () => {
  it('prefers nested avatar_url over flat fields', () => {
    const profile: TrainerProfileResponse = {
      avatar_url: 'https://flat.example/avatar.png',
      profile: {
        avatar_url: 'https://nested.example/avatar.png',
      },
    };

    expect(resolveAvatarUrlFromProfile(profile)).toBe('https://nested.example/avatar.png');
  });

  it('supports nested camelCase and flat fallbacks', () => {
    const profile: TrainerProfileResponse = {
      avatarUrl: 'https://flat.example/camel.png',
      profile: {
        avatarUrl: 'https://nested.example/camel.png',
      },
    };

    expect(resolveAvatarUrlFromProfile(profile)).toBe('https://nested.example/camel.png');
  });

  it('falls back to flat avatar when nested profile is missing', () => {
    const profile: TrainerProfileResponse = {
      avatar: 'https://flat.example/avatar-only.png',
    };

    expect(resolveAvatarUrlFromProfile(profile)).toBe('https://flat.example/avatar-only.png');
  });
});
