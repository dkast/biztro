"use server"

import { unstable_cache as cache } from "next/cache"

import prisma from "@/lib/prisma"
import { SubscriptionStatus } from "@/lib/types"
import { env } from "@/env.mjs"

/**
 * Retrieves an organization by its ID.
 *
 * @param id - The ID of the organization to retrieve.
 * @returns A promise that resolves to the organization object.
 */
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

/**
 * Retrieves an organization by its subdomain.
 *
 * @param subdomain - The subdomain of the organization.
 * @returns A promise that resolves to the organization object.
 */
export async function getOrganizationBySlug(slug: string) {
  return await cache(
    async () => {
      const org = await prisma.organization.findFirst({
        where: {
          slug
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
    [`organization-${slug}`],
    {
      revalidate: 900,
      tags: [`organization-${slug}`]
    }
  )()
}

/**
 * Retrieves the onboarding status of an organization.
 *
 * @param id - The ID of the organization.
 * @returns A promise that resolves to the organization's onboarding status.
 */
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
          slug: true,
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

/**
 * Retrieves all active organizations.
 * @returns A promise that resolves to an array of organizations with their subdomains.
 */
export async function getAllActiveOrganizations() {
  return await cache(
    async () => {
      const orgs = await prisma.organization.findMany({
        where: {
          OR: [
            { status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.TRIALING },
            { status: SubscriptionStatus.SPONSORED }
          ]
        },
        select: {
          slug: true
        }
      })
      return orgs
    },
    ["all-active-organizations"],
    {
      revalidate: 3600,
      tags: ["all-active-organizations"]
    }
  )()
}
