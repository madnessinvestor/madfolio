#!/usr/bin/env node
/**
 * Create admin user for Portfolio Tracker
 * Run: node scripts/create-admin.js
 */

import bcrypt from 'bcrypt';
import { db } from '../dist/server/db.js';
import { users } from '../dist/shared/models/auth.js';

const ADMIN_USERNAME = 'madnessinvestor';
const ADMIN_EMAIL = 'madnessinvestor@yahoo.com';
const ADMIN_PASSWORD = '123456';

(async () => {
  try {
    console.log('🔧 Creating admin user...');
    
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const [newUser] = await db.insert(users).values({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      authProvider: 'local',
      profileImageUrl: '/avatars/madnessinvestor.png',
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('📋 Credentials:');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    if (error.message?.includes('unique constraint')) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
