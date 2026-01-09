import fastitfyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import { env } from '@saas/env'
import fastifyScalar from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handle'
import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recovery'
import { resetPassword } from './routes/auth/reset-password'
import { createOrganization } from './routes/orgs/create-organization'
import { getMemberShip } from './routes/orgs/get-membership'
import { getOrganization } from './routes/orgs/get-organization'
import { getOrganizations } from './routes/orgs/get-organizations'

const app = fastify({
  logger: {
    level: 'error',
  },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js Saas',
      description: 'Full-stack SaaS app with multi-tenant & RBAC.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifyScalar, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastitfyCors)

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(authenticateWithGithub)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)

app.register(createOrganization)
app.register(getMemberShip)
app.register(getOrganization)
app.register(getOrganizations)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
