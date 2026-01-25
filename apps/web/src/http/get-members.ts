import type { Role } from '@saas/auth'

import { api } from './api-client'

interface GetMembersResponse {
  members: {
    id: string
    userId: string
    role: Role
    name: string | null
    avatarUrl: string | null
    email: string | null
  }[]
}

export async function getMembers(org: string) {
  return await api
    .get(`organizations/${org}/members`)
    .json<GetMembersResponse>()
}
