import { FormEvent, useState, useTransition } from 'react'

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

export function useFormState(
  action: (data: FormData) => Promise<IFormState>,
  initialState?: IFormState,
) {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<IFormState>(
    initialState ?? {
      success: false,
      message: null,
      errors: null,
    },
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const state = await action(data)
      setFormState(state)
    })
  }

  return [formState, handleSubmit, isPending] as const
}
