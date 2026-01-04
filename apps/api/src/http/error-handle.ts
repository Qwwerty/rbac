import { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

import { BadRequestError } from './routes/_errors/bad-request-error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const errors = error.validation

    request.log.error(errors)

    return reply.status(400).send({
      message: 'Validation error',
      errors,
    })
  }

  if (error instanceof BadRequestError) {
    const errorMessage = {
      message: error.message,
    }

    request.log.error(errorMessage)
    return reply.status(400).send(errorMessage)
  }

  if (error instanceof UnauthorizedError) {
    const errorMessage = {
      message: error.message,
    }

    request.log.error(errorMessage)
    return reply.status(401).send(errorMessage)
  }

  request.log.error({ message: 'Internal server error.' })
  return reply.status(500).send({ message: 'Internal server error.' })
}
