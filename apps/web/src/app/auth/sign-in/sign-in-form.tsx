'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState, useTransition } from 'react'

import githubIcon from '@/assets/github-icon.svg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithEmailAndPassword } from './actions'

interface IFieldError {
  errors: string[]
}

interface IValidationErrors {
  errors: string[]
  properties?: {
    email?: IFieldError
    password?: IFieldError
  }
}

interface IFormState {
  success: boolean
  message: string | null
  errors: IValidationErrors | null
}

export function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<IFormState>({
    success: false,
    message: null,
    errors: null,
  })

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const state = await signInWithEmailAndPassword(data)
      setFormState(state)
    })
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {formState.success === false && formState.message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Sign in failed!</AlertTitle>
          <AlertDescription>
            <p>{formState.message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input name="email" type="email" id="email" />

        {formState.errors?.properties?.email && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {formState.errors.properties.email.errors[0]}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input name="password" type="password" id="password" />

        {formState.errors?.properties?.password && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {formState.errors.properties.password.errors[0]}
          </p>
        )}

        <Link
          href="/auth/forgot-password"
          className="text-foreground text-xs font-medium hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Sign in with e-mail'
        )}
      </Button>
      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-up">Create new account</Link>
      </Button>
      <Separator />
      <Button type="submit" variant="outline" className="w-full">
        <Image src={githubIcon} className="mr-2 size-4 dark:invert" alt="" />
        Sign in with GitHub
      </Button>
    </form>
  )
}
