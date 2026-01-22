import { api } from './api-client'

interface GetProjectsResponse {
  projects: {
    id: string
    description: string
    name: string
    slug: string
    avatarUrl: string | null
    organizationId: string
    createdAt: string
    ownerId: string
    owner: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
  }[]
}

export async function getProjects(org: string) {
  return await api
    .get(`organizations/${org}/projects`)
    .json<GetProjectsResponse>()
}
