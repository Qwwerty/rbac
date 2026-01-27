import { FormEvent, useState, useTransition } from 'react'
import { requestFormReset } from 'react-dom'

interface IFieldError {
  errors: string[]
}

interface IValidationErrors {
  errors: string[]
  properties?: Record<string, IFieldError>
}

interface IFormState {
  success: boolean
  message: string | null
  errors: IValidationErrors | null
}

export function useFormState(
  action: (data: FormData) => Promise<IFormState>,
  onSuccess?: () => Promise<void> | void,
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
    const state = await action(data)

    if (state.success === true && onSuccess) {
      await onSuccess()
    }

    startTransition(() => {
      setFormState(state)
      requestFormReset(form)
    })
  }

  return [formState, handleSubmit, isPending] as const
}
