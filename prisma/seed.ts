import { PrismaClient } from '@prisma/client';
import { hashPassword, generateMemberNumber, generateDogRegistrationNumber } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default SDS organization
  const sdsOrg = await prisma.organization.upsert({
    where: { subdomain: 'sds' },
    update: {},
    create: {
      name: 'Service Dog Standards',
      subdomain: 'sds',
      theme: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#10b981',
      },
      settings: {
        allowRegistration: true,
        requireEmailVerification: true,
        defaultRole: 'HANDLER',
      },
    },
  });

  console.log('✅ Created SDS organization');

  // Create test users with different roles
  const adminPassword = await hashPassword('Admin123!');
  const trainerPassword = await hashPassword('Trainer123!');
  const handlerPassword = await hashPassword('Handler123!');
  const superAdminPassword = await hashPassword('SuperAdmin123!');

  // Create Generic Super Admin account
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@servicedogstandards.com' },
    update: {},
    create: {
      email: 'superadmin@servicedogstandards.com',
      hashedPassword: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      accountType: 'INDIVIDUAL',
      memberNumber: generateMemberNumber(),
      organizationId: sdsOrg.id,
      emailVerified: new Date(),
      profileComplete: 95,
      setupStep: 5,
      isActive: true,
      phone: null,
      profileImage: null,
      bannerImage: null,
      bio: 'Generic Super Administrator Account',
      website: null,
      address: null,
      coordinates: null,
      timezone: null,
      publicProfile: true,
      emailNotifications: true,
      smsNotifications: false,
      trainerUrl: null,
      businessName: null,
      businessLicense: null,
      insuranceInfo: null,
      specialties: [],
      lastLoginAt: null,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
  });

  // Create System Super Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@servicedogstandards.com' },
    update: {},
    create: {
      email: 'admin@servicedogstandards.com',
      hashedPassword: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      accountType: 'ORGANIZATION',
      memberNumber: generateMemberNumber(),
      organizationId: sdsOrg.id,
      emailVerified: new Date(),
      profileComplete: 85,
      isActive: true,
      publicProfile: false,
      bio: 'System administrator for Service Dog Standards platform.',
    },
  });

  console.log('✅ Created Generic Super Admin account');
  console.log('✅ Created System Admin account');

  // Create Trainer user
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      email: 'trainer@example.com',
      hashedPassword: trainerPassword,
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'TRAINER',
      accountType: 'PROFESSIONAL',
      memberNumber: generateMemberNumber(),
      organizationId: sdsOrg.id,
      emailVerified: new Date(),
      profileComplete: 90,
      isActive: true,
      publicProfile: true,
      bio: 'Certified service dog trainer with 10+ years of experience.',
      businessName: 'Wilson Service Dog Training',
      specialties: ['Mobility Assistance', 'Medical Alert', 'PTSD Support'],
      trainerUrl: 'sarah-wilson',
      website: 'https://wilsonservicedogs.com',
      phone: '(555) 123-4567',
    },
  });

  // Create Handler user
  const handlerUser = await prisma.user.upsert({
    where: { email: 'handler@example.com' },
    update: {},
    create: {
      email: 'handler@example.com',
      hashedPassword: handlerPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'HANDLER',
      accountType: 'INDIVIDUAL',
      memberNumber: generateMemberNumber(),
      organizationId: sdsOrg.id,
      emailVerified: new Date(),
      profileComplete: 75,
      isActive: true,
      publicProfile: true,
      bio: 'Proud handler of Max, my mobility assistance dog.',
      phone: '(555) 987-6543',
    },
  });

  console.log('✅ Created test users');

  // Create sample dogs
  const serviceDog = await prisma.dog.create({
    data: {
      registrationNum: generateDogRegistrationNumber(),
      name: 'Max',
      breed: 'Golden Retriever',
      birthDate: new Date('2020-05-15'),
      gender: 'MALE_NEUTERED',
      weight: 70,
      color: 'Golden',
      status: 'ACTIVE',
      ownerId: handlerUser.id,
      organizationId: sdsOrg.id,
      bio: 'Max is a highly trained mobility assistance dog who helps his handler with balance and stability.',
      publicProfile: true,
      showInDirectory: true,
      trainingStartDate: new Date('2020-08-01'),
      trainingEndDate: new Date('2022-02-15'),
    },
  });

  const trainingDog = await prisma.dog.create({
    data: {
      registrationNum: generateDogRegistrationNumber(),
      name: 'Luna',
      breed: 'Labrador Retriever',
      birthDate: new Date('2023-03-10'),
      gender: 'FEMALE_SPAYED',
      weight: 55,
      color: 'Yellow',
      status: 'IN_TRAINING',
      ownerId: trainerUser.id,
      organizationId: sdsOrg.id,
      bio: 'Luna is currently in training to become a medical alert dog.',
      publicProfile: true,
      showInDirectory: true,
      trainingStartDate: new Date('2023-08-01'),
    },
  });

  console.log('✅ Created sample dogs');

  // Create dog-user relationships
  await prisma.dogUserRelationship.create({
    data: {
      dogId: serviceDog.id,
      userId: trainerUser.id,
      relationship: 'TRAINER',
      status: 'ACCEPTED',
      canEdit: true,
      canView: true,
      canOrder: false,
      notes: 'Trained Max for mobility assistance',
      respondedAt: new Date(),
    },
  });

  await prisma.dogUserRelationship.create({
    data: {
      dogId: trainingDog.id,
      userId: handlerUser.id,
      relationship: 'HANDLER',
      status: 'PENDING',
      canEdit: false,
      canView: true,
      canOrder: false,
      notes: 'Future handler for Luna',
    },
  });

  console.log('✅ Created dog relationships');

  // Create sample agreements
  await prisma.agreement.create({
    data: {
      userId: handlerUser.id,
      type: 'TRAINING_BEHAVIOR_STANDARDS',
      version: '2024.1',
      content: {
        title: 'SDS Training & Behavior Standards',
        sections: ['Public Access', 'Training Requirements', 'Behavior Standards'],
      },
      acceptedAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000), // 4 years
      isActive: true,
    },
  });

  await prisma.agreement.create({
    data: {
      userId: trainerUser.id,
      type: 'TRAINER_AGREEMENT',
      version: '2024.1',
      content: {
        title: 'SDS Trainer Agreement',
        sections: ['Professional Standards', 'Training Methods', 'Certification Requirements'],
      },
      acceptedAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
      isActive: true,
    },
  });

  console.log('✅ Created sample agreements');

  // Create sample achievements
  await prisma.achievement.create({
    data: {
      dogId: serviceDog.id,
      title: 'Public Access Test Certification',
      description: 'Successfully completed comprehensive public access evaluation',
      type: 'CERTIFICATION',
      achievedAt: new Date('2022-02-28'),
      issuer: 'Service Dog Standards',
      certificateNumber: 'PAT-2022-001234',
    },
  });

  await prisma.achievement.create({
    data: {
      dogId: serviceDog.id,
      title: 'Mobility Assistance Certification',
      description: 'Certified for mobility assistance tasks including balance and stability support',
      type: 'CERTIFICATION',
      achievedAt: new Date('2022-03-15'),
      issuer: 'Wilson Service Dog Training',
      certificateNumber: 'MOB-2022-005678',
    },
  });

  console.log('✅ Created sample achievements');

  // Create sample items for e-commerce
  await prisma.item.create({
    data: {
      name: 'SDS Registration Kit',
      description: 'Complete registration package including ID card, certificate, and patches',
      type: 'PHYSICAL',
      price: 49.99,
      sku: 'SDS-REG-KIT-001',
      stockQuantity: 100,
      isActive: true,
      requiresDog: true,
      customizable: true,
      customFields: {
        dogName: { type: 'text', required: true },
        handlerName: { type: 'text', required: true },
        cardColor: { type: 'select', options: ['Blue', 'Red', 'Green'] },
      },
      images: ['/products/registration-kit.jpg'],
      weight: 0.5,
      dimensions: { length: 8, width: 6, height: 1 },
      organizationId: sdsOrg.id,
    },
  });

  await prisma.item.create({
    data: {
      name: 'Digital Certificate Download',
      description: 'Official SDS digital certificate with QR code verification',
      type: 'DIGITAL',
      price: 19.99,
      sku: 'SDS-CERT-DIG-001',
      isActive: true,
      requiresDog: true,
      customizable: true,
      customFields: {
        dogName: { type: 'text', required: true },
        handlerName: { type: 'text', required: true },
      },
      digitalFiles: {
        certificate: { template: 'sds-certificate.pdf', fillable: true },
        walletCard: { template: 'wallet-card.pkpass', customizable: true },
      },
      organizationId: sdsOrg.id,
    },
  });

  console.log('✅ Created sample products');

  // Summary
  const userCount = await prisma.user.count();
  const dogCount = await prisma.dog.count();
  const achievementCount = await prisma.achievement.count();
  const itemCount = await prisma.item.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   • Organizations: 1`);
  console.log(`   • Users: ${userCount}`);
  console.log(`   • Dogs: ${dogCount}`);
  console.log(`   • Achievements: ${achievementCount}`);
  console.log(`   • Products: ${itemCount}`);
  console.log('\n👥 Test Accounts:');
  console.log('   • Admin: admin@servicedogstandards.com / Admin123!');
  console.log('   • Trainer: trainer@example.com / Trainer123!');
  console.log('   • Handler: handler@example.com / Handler123!');
  console.log('\n🚀 Ready for authentication testing!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });