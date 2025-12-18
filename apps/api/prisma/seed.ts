import { faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({
  adapter,
})

type MemberRole = 'ADMIN' | 'MEMBER' | 'BILLING'

type OrgMember = {
  userId: string
  role: MemberRole
}

type OrganizationSeed = {
  name: string
  slug: string
  domain?: string
  shouldAttachUsersByDomain?: boolean
  members: OrgMember[]
}

function createProject(userIds: string[]) {
  return {
    name: faker.lorem.words(5),
    slug: faker.lorem.slug(5),
    description: faker.lorem.paragraph(),
    avatarUrl: faker.image.avatarGitHub(),
    onwerId: faker.helpers.arrayElement(userIds),
  }
}

function createProjects(userIds: string[], amount = 3) {
  return {
    createMany: {
      data: Array.from({ length: amount }).map(() => createProject(userIds)),
    },
  }
}

function createMembers(
  members: Array<{ userId: string; role: 'ADMIN' | 'MEMBER' | 'BILLING' }>,
) {
  return {
    createMany: {
      data: members,
    },
  }
}

async function seed() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
  const password = await hash('123456', 1)
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@acme.com',
        avatarUrl: 'https://github.com/qwwerty.png',
        passwordHash: password,
      },
    }),
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash: password,
      },
    }),
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash: password,
      },
    }),
  ])
  const [user1, user2, user3] = users
  const userIds = users.map((u) => u.id)
  const organizations: OrganizationSeed[] = [
    {
      name: 'Acme Inc (Admin)',
      slug: 'acme-admin',
      domain: 'acme.com',
      shouldAttachUsersByDomain: true,
      members: [
        { userId: user1.id, role: 'ADMIN' },
        { userId: user2.id, role: 'MEMBER' },
        { userId: user3.id, role: 'MEMBER' },
      ],
    },
    {
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      members: [
        { userId: user1.id, role: 'MEMBER' },
        { userId: user2.id, role: 'ADMIN' },
        { userId: user3.id, role: 'MEMBER' },
      ],
    },
    {
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      members: [
        { userId: user1.id, role: 'BILLING' },
        { userId: user2.id, role: 'MEMBER' },
        { userId: user3.id, role: 'MEMBER' },
      ],
    },
  ]
  for (const org of organizations) {
    await prisma.organization.create({
      data: {
        name: org.name,
        slug: org.slug,
        domain: org.domain,
        shouldAttachUsersByDomain: org.shouldAttachUsersByDomain,
        avatarUrl: faker.image.avatarGitHub(),
        ownerId: user1.id,
        projects: createProjects(userIds),
        members: createMembers(org.members),
      },
    })
  }
}

seed()
  .then(() => console.log('Database seeded! 🌱'))
  .finally(() => prisma.$disconnect())
