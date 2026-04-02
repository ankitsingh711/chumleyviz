import apiClient from '@/services/api/client';
import type { ApiAuthResponse } from '@/types/api';
import type { UserSession } from '@/types/models';

function mapUser(user: ApiAuthResponse['user']): UserSession {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
  };
}

export async function loginWithMicrosoft(): Promise<{ token: string; user: UserSession }> {
  const { data } = await apiClient.post<ApiAuthResponse>('/login', {
    provider: 'microsoft_sso',
  });

  return {
    token: data.access_token,
    user: mapUser(data.user),
  };
}
