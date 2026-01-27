'use server'

import { revalidateTag } from 'next/cache'

import { acceptInvite } from '@/http/accept-invite'
import { rejectInvite } from '@/http/reject-invite'

export async function acceptInviteAction(inviteId: string) {
  await acceptInvite(inviteId)
  revalidateTag('orgaizations', { expire: 0 })
}

export async function rejectInviteAction(inviteId: string) {
  await rejectInvite(inviteId)
  revalidateTag('orgaizations', { expire: 0 })
}
