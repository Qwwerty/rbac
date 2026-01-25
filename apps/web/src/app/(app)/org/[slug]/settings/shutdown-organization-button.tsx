'use client'

import { AlertTriangle, Loader2, XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { InterceptedSheetContent } from '@/components/intercepted-sheet-content'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useFormState } from '@/hooks/use-form-state'

import { shutdownOrganizationAction } from './actions'

export function ShutdownOrganizationButton() {
  const { slug: org } = useParams<{ slug: string }>()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const isConfirmationValid = confirmation === org

  const [{ success, message }, handleSubmit, isPending] = useFormState(
    shutdownOrganizationAction,
    () => {
      router.push('/')
    },
  )

  function handleOpenChange(open: boolean) {
    setIsOpen(open)

    if (!open) {
      setConfirmation('')
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Shutdown organization failed!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}

        <InterceptedSheetContent>
          <SheetHeader>
            <SheetTitle>Shut down organization</SheetTitle>
            <SheetDescription>
              This action removes projects, members, and settings associated
              with the organization.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col gap-6 px-4 pb-6"
          >
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>This action is permanent</AlertTitle>
              <AlertDescription>
                <p>
                  You are about to shut down the organization{' '}
                  <span className="font-medium">{org}</span>. This action cannot
                  be undone.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="org">Type {org} to confirm</Label>
              <Input
                id="org"
                name="org"
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                The organization will be shut down immediately.
              </p>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isConfirmationValid}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Shut down organization'
                )}
              </Button>
            </SheetFooter>
          </form>
        </InterceptedSheetContent>
      </Sheet>

      <Button
        onClick={() => setIsOpen(true)}
        type="button"
        variant="destructive"
        className="w-56"
      >
        <XCircle className="mr-2 size-4" />
        Shutdown organization
      </Button>
    </>
  )
}
