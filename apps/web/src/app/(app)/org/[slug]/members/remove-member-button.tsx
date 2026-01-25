'use client'

import { AlertTriangle, Loader2, UserMinus } from 'lucide-react'
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

import { removeMemberAction } from './actions'

interface RemoveMemberButtonProps {
  memberEmail: string
  memberId: string
  memberName: string
  disabled?: boolean
}

export function RemoveMemberButton({
  memberEmail,
  memberId,
  memberName,
  disabled,
}: RemoveMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRemoveMember() {
    startTransition(async () => {
      await removeMemberAction(memberId)
      setIsOpen(false)
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <InterceptedSheetContent>
          <SheetHeader>
            <SheetTitle>Remove member</SheetTitle>
            <SheetDescription>
              This action removes the member from the organization.
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col gap-6 px-4 pb-6">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>This action is permanent</AlertTitle>
              <AlertDescription>
                <p>
                  You are about to remove{' '}
                  <span className="font-medium">{memberName}</span> (
                  {memberEmail}). This action cannot be undone.
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
                onClick={handleRemoveMember}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Remove member'
                )}
              </Button>
            </SheetFooter>
          </div>
        </InterceptedSheetContent>
      </Sheet>

      <Button
        disabled={disabled}
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      >
        <UserMinus className="mr-2 size-4" />
        Remove
      </Button>
    </>
  )
}
