import apiClient from '@/services/api/client';
import type { ApiAuthResponse } from '@/types/api';
import type { UserSession } from '@/types/models';

import { acquireMicrosoftAccessToken } from './msalService';

function mapUser(user: ApiAuthResponse['user']): UserSession {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

export async function loginWithMicrosoft(): Promise<{ token: string; user: UserSession }> {
  const microsoftAccessToken = await acquireMicrosoftAccessToken();

  const { data } = await apiClient.post<ApiAuthResponse>('/auth/microsoft/exchange', {
    access_token: microsoftAccessToken,
  });

  return {
    token: data.access_token,
    user: mapUser(data.user),
  };
}
