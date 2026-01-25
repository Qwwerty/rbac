'use server'

import { HTTPError } from 'ky'
import z from 'zod'

import { shutdownOrganization } from '@/http/shutdown-organization'

const shutdownOrganizationSchema = z.object({
  org: z.string(),
})

export async function shutdownOrganizationAction(data: FormData) {
  const result = shutdownOrganizationSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error)
    return { success: false, message: null, errors }
  }

  const { org } = result.data

  try {
    await shutdownOrganization({
      org,
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }
    console.log(error)
    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes',
      errors: null,
    }
  }

  return {
    success: true,
    message: 'Successfully saved the project',
    errors: null,
  }
}
