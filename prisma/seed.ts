import "dotenv/config"

import { PrismaLibSql } from "@prisma/adapter-libsql"

import { appConfig } from "../src/app/config"
import { PrismaClient } from "../src/generated/prisma-client/client"

const categoryNames = [
  "Platillos",
  "Bebidas",
  "Postres",
  "Complementos"
] as const

type CategoryName = (typeof categoryNames)[number]

type SampleItem = {
  name: string
  description: string
  price: number
  category: CategoryName
  variants?: { name: string; price: number }[]
}

const sampleItems = [
  {
    name: "Tacos al pastor",
    description: "Tacos de cerdo al pastor con piña y cilantro.",
    price: 89,
    category: "Platillos",
    variants: [
      { name: "Orden de 3", price: 89 },
      { name: "Orden de 5", price: 139 }
    ]
  },
  {
    name: "Quesadillas de queso",
    description: "Quesadillas de maíz con queso fundido.",
    price: 75,
    category: "Platillos"
  },
  {
    name: "Enchiladas verdes",
    description: "Enchiladas de pollo con salsa verde y crema.",
    price: 105,
    category: "Platillos"
  },
  {
    name: "Chilaquiles rojos",
    description: "Totopos en salsa roja con queso y crema.",
    price: 95,
    category: "Platillos"
  },
  {
    name: "Torta de milanesa",
    description: "Torta de milanesa con aguacate y frijoles.",
    price: 110,
    category: "Platillos"
  },
  {
    name: "Pozole rojo",
    description: "Pozole de maíz cacahuazintle con lechuga y rábanos.",
    price: 120,
    category: "Platillos"
  },
  {
    name: "Sopes de tinga",
    description: "Sopes de tinga de pollo con frijoles y queso.",
    price: 85,
    category: "Platillos"
  },
  {
    name: "Guacamole",
    description: "Guacamole fresco servido con totopos.",
    price: 65,
    category: "Complementos"
  },
  {
    name: "Arroz con leche",
    description: "Arroz con leche y canela.",
    price: 45,
    category: "Postres"
  },
  {
    name: "Agua de jamaica",
    description: "Agua fresca de jamaica preparada en casa.",
    price: 30,
    category: "Bebidas",
    variants: [
      { name: "Chica", price: 30 },
      { name: "Grande", price: 45 }
    ]
  },
  {
    name: "Hamburguesa clásica",
    description: "Hamburguesa de res con queso, lechuga y jitomate.",
    price: 135,
    category: "Platillos",
    variants: [
      { name: "Sencilla", price: 135 },
      { name: "Con papas", price: 165 }
    ]
  },
  {
    name: "Café de olla",
    description: "Café de olla con piloncillo y canela.",
    price: 38,
    category: "Bebidas"
  },
  {
    name: "Flautas de pollo",
    description: "Flautas crujientes de pollo con salsa y crema.",
    price: 98,
    category: "Platillos"
  },
  {
    name: "Agua de horchata",
    description: "Agua fresca de arroz con canela.",
    price: 32,
    category: "Bebidas"
  },
  {
    name: "Pastel de chocolate",
    description: "Rebanada de pastel de chocolate.",
    price: 70,
    category: "Postres"
  }
] satisfies SampleItem[]

const organizations = [
  {
    name: "Pruebas - Plan Básico",
    slug: "seed-basic",
    description: "Organización de prueba con el límite del plan básico.",
    plan: "BASIC",
    status: "ACTIVE",
    itemCount: appConfig.itemLimit
  },
  {
    name: "Pruebas - Pro Patrocinado",
    slug: "seed-pro-sponsored",
    description: "Organización de prueba con acceso Pro patrocinado.",
    plan: "PRO",
    status: "SPONSORED",
    itemCount: appConfig.itemLimit + 5
  }
] as const

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.LOCAL_DATABASE_URL ?? "file:./local.db"
  })
})

async function seed() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase()
  const owner = ownerEmail
    ? await prisma.user.findUnique({
        where: { email: ownerEmail },
        select: { id: true }
      })
    : null

  if (ownerEmail && !owner) {
    throw new Error(`No user found for SEED_OWNER_EMAIL=${ownerEmail}`)
  }

  for (const definition of organizations) {
    const result = await prisma.$transaction(async tx => {
      const organization = await tx.organization.upsert({
        where: { slug: definition.slug },
        update: {
          name: definition.name,
          description: definition.description,
          plan: definition.plan,
          status: definition.status
        },
        create: {
          name: definition.name,
          slug: definition.slug,
          description: definition.description,
          plan: definition.plan,
          status: definition.status
        }
      })

      await tx.menuItem.deleteMany({
        where: { organizationId: organization.id }
      })
      await tx.category.deleteMany({
        where: { organizationId: organization.id }
      })

      if (owner) {
        const membership = await tx.member.findFirst({
          where: {
            organizationId: organization.id,
            userId: owner.id
          },
          select: { id: true }
        })

        if (membership) {
          await tx.member.update({
            where: { id: membership.id },
            data: { role: "owner" }
          })
        } else {
          await tx.member.create({
            data: {
              id: `${organization.id}-${owner.id}`,
              organizationId: organization.id,
              userId: owner.id,
              role: "owner",
              createdAt: new Date()
            }
          })
        }
      }

      const categories = await Promise.all(
        categoryNames.map(name =>
          tx.category.create({
            data: {
              name,
              organizationId: organization.id
            },
            select: { id: true, name: true }
          })
        )
      )
      const categoryIds = new Map(
        categories.map(category => [category.name, category.id] as const)
      )

      const items = Array.from({ length: definition.itemCount }, (_, index) => {
        const sample = sampleItems[index]

        return {
          name: sample?.name ?? `Producto de prueba ${index + 1}`,
          description:
            sample?.description ?? "Producto de prueba para el catálogo.",
          price: sample?.price ?? 50 + index * 5,
          category: sample?.category ?? "Platillos",
          variants: sample?.variants ?? [
            { name: "Regular", price: sample?.price ?? 50 + index * 5 }
          ]
        }
      })

      await Promise.all(
        items.map(item => {
          const categoryId = categoryIds.get(item.category)

          if (!categoryId) {
            throw new Error(`Missing seeded category: ${item.category}`)
          }

          return tx.menuItem.create({
            data: {
              name: item.name,
              description: item.description,
              status: "ACTIVE",
              organizationId: organization.id,
              categoryId,
              variants: {
                create: item.variants
              }
            }
          })
        })
      )

      return {
        name: organization.name,
        itemCount: items.length,
        categoryCount: categories.length
      }
    })

    console.info(
      `Seeded ${result.name} with ${result.categoryCount} categories and ${result.itemCount} items.`
    )
  }

  if (!ownerEmail) {
    console.info(
      "Set SEED_OWNER_EMAIL to attach both organizations to an existing user."
    )
  }
}

try {
  await seed()
} catch (error) {
  console.error("Database seed failed.", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
