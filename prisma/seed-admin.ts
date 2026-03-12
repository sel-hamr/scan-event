import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })
  
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
