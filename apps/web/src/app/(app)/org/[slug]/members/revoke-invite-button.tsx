'use client'

import { AlertTriangle, Loader2, XOctagon } from 'lucide-react'
import { useState, useTransition } from 'react'

import { InterceptedSheetContent } from '@/components/intercepted-sheet-content'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { revokeInviteAction } from './actions'

interface RevokeInviteButtonProps {
  inviteEmail: string
  inviteId: string
}

export function RevokeInviteButton({
  inviteEmail,
  inviteId,
}: RevokeInviteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRevokeInvite() {
    startTransition(async () => {
      await revokeInviteAction(inviteId)
      setIsOpen(false)
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <InterceptedSheetContent>
          <SheetHeader>
            <SheetTitle>Revoke invite</SheetTitle>
            <SheetDescription>
              This action revokes the pending invitation.
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col gap-6 px-4 pb-6">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>This action is permanent</AlertTitle>
              <AlertDescription>
                <p>
                  You are about to revoke the invite for{' '}
                  <span className="font-medium">{inviteEmail}</span>. This
                  action cannot be undone.
                </p>
              </AlertDescription>
            </Alert>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost" disabled={isPending}>
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={handleRevokeInvite}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Revoke invite'
                )}
              </Button>
            </SheetFooter>
          </div>
        </InterceptedSheetContent>
      </Sheet>

      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      >
        <XOctagon className="mr-2 size-4" />
        Revoke invite
      </Button>
    </>
  )
}
