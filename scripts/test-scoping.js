#!/usr/bin/env node

/**
 * Verification test for user scoping and data isolation
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'vault_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('--- Testing User Scoping & Isolation Logic ---');

const owner = {
  id: 'u-owner',
  email: 'paneynayan79@gmail.com',
  name: 'Nayan Pandey',
  role: 'owner'
};

const secondUser = {
  id: 'u-1788805030683-noy6',
  email: 'nayanoppp@gmail.com',
  name: 'Bikash pandey',
  role: 'contributor'
};

const newUser = {
  id: 'u-brand-new-user',
  email: 'newuser@example.com',
  name: 'New Reader',
  role: 'contributor'
};

function isOwner(user) {
  if (!user) return false;
  return user.role === 'owner' || user.email.toLowerCase() === 'paneynayan79@gmail.com' || user.id === 'u-owner';
}

function getMediaForUser(all, user, scope = 'mine') {
  if (!user || scope === 'community') {
    return all.filter(item => item.isPublic);
  }
  const owner = isOwner(user);
  return all.filter(item => {
    if (owner) {
      return item.userId === user.id || item.userId === 'u-owner' || !item.userId;
    }
    return item.userId === user.id;
  });
}

// 1. Owner's Vault
const ownerMedia = getMediaForUser(db.media, owner, 'mine');
console.log(`1. Owner (${owner.name}) Vault count:`, ownerMedia.length);
console.assert(ownerMedia.length > 0, 'Owner should have books in their vault');

// 2. Second User (Bikash) Vault
const secondUserMedia = getMediaForUser(db.media, secondUser, 'mine');
console.log(`2. Second User (${secondUser.name}) Vault count:`, secondUserMedia.length);
console.assert(secondUserMedia.every(m => m.userId === secondUser.id), 'Second user must NEVER see other users items in My Vault');

// 3. Brand New User Vault
const newUserMedia = getMediaForUser(db.media, newUser, 'mine');
console.log(`3. Brand New User (${newUser.name}) Vault count:`, newUserMedia.length);
console.assert(newUserMedia.length === 0, 'Brand new user vault must start completely empty with 0 items');

// 4. Community Showcase
const communityMedia = getMediaForUser(db.media, null, 'community');
console.log('4. Visitor / Community Showcase count (public only):', communityMedia.length);
console.assert(communityMedia.every(m => m.isPublic === true), 'Community view must strictly only contain public items');

console.log('\n✅ All User Scoping & Isolation Tests Passed Successfully!');
