"use server"

import { unstable_cache as cache } from "next/cache"

import prisma from "@/lib/prisma"
import { env } from "@/env.mjs"

export async function getOrganization(id: string) {
  return await cache(
    async () => {
      const org = await prisma.organization.findUnique({
        where: {
          id
        }
      })

      if (org?.banner) {
        org.banner = `${env.R2_CUSTOM_DOMAIN}/${org.banner}`
      }

      if (org?.logo) {
        org.logo = `${env.R2_CUSTOM_DOMAIN}/${org.logo}`
      }

      return org
    },
    [`organization-${id}`],
    {
      revalidate: 900,
      tags: [`organization-${id}`]
    }
  )()
}

export async function getOrganizationBySubdomain(subdomain: string) {
  return await cache(
    async () => {
      const org = await prisma.organization.findFirst({
        where: {
          subdomain
        }
      })

      if (org?.banner) {
        org.banner = `${env.R2_CUSTOM_DOMAIN}/${org.banner}`
      }

      if (org?.logo) {
        org.logo = `${env.R2_CUSTOM_DOMAIN}/${org.logo}`
      }

      return org
    },
    [`organization-${subdomain}`],
    {
      revalidate: 900,
      tags: [`organization-${subdomain}`]
    }
  )()
}

export async function getOrganizationOnboardingStatus(id: string) {
  return await cache(
    async () => {
      const orgData = await prisma.organization.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          banner: true,
          logo: true,
          location: {
            select: {
              id: true
            }
          },
          _count: {
            select: {
              menuItems: true
            }
          }
        }
      })

      return orgData
    },
    [`organization-${id}-onboarding`],
    {
      revalidate: 900,
      tags: [`organization-${id}-onboarding`]
    }
  )()
}
