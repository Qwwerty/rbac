import { env } from '@saas/env'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithGoogle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/google',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with google',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const googleOAuthURL = new URL('https://oauth2.googleapis.com/token')

      googleOAuthURL.searchParams.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID)
      googleOAuthURL.searchParams.set(
        'client_secret',
        env.GOOGLE_OAUTH_CLIENT_SECRET,
      )
      googleOAuthURL.searchParams.set('grant_type', 'authorization_code')
      googleOAuthURL.searchParams.set(
        'redirect_uri',
        env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
      )
      googleOAuthURL.searchParams.set('code', code)

      const googleAccessTokenResponse = await fetch(googleOAuthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      const googleAcessTokenData = await googleAccessTokenResponse.json()

      const { access_token: googleAccessToken } = z
        .object({
          access_token: z.string(),
          expires_in: z.number().optional(),
          refresh_token: z.string().optional(),
          scope: z.string().optional(),
          token_type: z.literal('Bearer'),
          id_token: z.string().optional(),
        })
        .parse(googleAcessTokenData)

      const googleUserResponse = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        },
      )

      const googleUserData = await googleUserResponse.json()

      const {
        sub: googleId,
        name,
        email,
        picture: avatarUrl,
      } = z
        .object({
          sub: z.string(),
          email: z.email(),
          name: z.string().nullable().optional(),
          picture: z.url().optional(),
        })
        .parse(googleUserData)

      if (email == null) {
        throw new BadRequestError(
          'Your Google account must have an email to authenticate.',
        )
      }

      let user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatarUrl,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GOOGLE',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
