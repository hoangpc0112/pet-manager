import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  writeBatch
} from 'firebase/firestore';
import fs from 'node:fs';
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  // eslint-disable-next-line no-console
  console.error('Missing Firebase env vars:', missingConfigKeys.join(', '));
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAX_BATCH_SIZE = 450;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    uid: '',
    uids: [],
    uidsFile: '',
    allUsers: false,
    dryRun: false,
    includeCommunity: false
  };

  args.forEach((arg) => {
    if (arg.startsWith('--uid=')) {
      options.uid = arg.slice('--uid='.length).trim();
      return;
    }

    if (arg.startsWith('--uids=')) {
      options.uids = arg
        .slice('--uids='.length)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }

    if (arg.startsWith('--uids-file=')) {
      options.uidsFile = arg.slice('--uids-file='.length).trim();
      return;
    }

    if (arg === '--all-users') {
      options.allUsers = true;
      return;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      return;
    }

    if (arg === '--include-community') {
      options.includeCommunity = true;
    }
  });

  const selectedModes = [
    Boolean(options.uid),
    options.uids.length > 0,
    Boolean(options.uidsFile),
    options.allUsers
  ].filter(Boolean).length;

  if (selectedModes === 0) {
    throw new Error(
      'Missing required argument. Use one mode: --uid=<...> | --uids=<uid1,uid2> | --uids-file=<path> | --all-users.'
    );
  }

  if (selectedModes > 1) {
    throw new Error(
      'Please use only one mode at a time: --uid | --uids | --uids-file | --all-users.'
    );
  }

  return options;
};

const parseUidFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];

  if (content.startsWith('[')) {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('--uids-file JSON must be an array of uid strings.');
    }
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const getUserIdsFromUsersCollection = async () => {
  const snapshot = await getDocs(query(collection(db, 'users')));
  return snapshot.docs.map((item) => item.id).filter(Boolean);
};

const resolveTargetUids = async (options) => {
  if (options.uid) return [options.uid];
  if (options.uids.length > 0) return options.uids;
  if (options.uidsFile) return parseUidFile(options.uidsFile);
  if (options.allUsers) return getUserIdsFromUsersCollection();
  return [];
};

const deepMerge = (base, override) => {
  if (Array.isArray(base) || Array.isArray(override)) {
    return Array.isArray(override) ? override : base;
  }

  if (typeof base !== 'object' || base === null) {
    return override === undefined ? base : override;
  }

  if (typeof override !== 'object' || override === null) {
    return override === undefined ? base : override;
  }

  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  const merged = {};

  keys.forEach((key) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(override, key);
    const baseValue = base[key];
    const overrideValue = hasOverride ? override[key] : undefined;

    if (!hasOverride) {
      merged[key] = baseValue;
      return;
    }

    if (
      typeof baseValue === 'object' &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof overrideValue === 'object' &&
      overrideValue !== null &&
      !Array.isArray(overrideValue)
    ) {
      merged[key] = deepMerge(baseValue, overrideValue);
      return;
    }

    merged[key] = overrideValue;
  });

  return merged;
};

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const migrateAppConfig = async ({ uid, dryRun }) => {
  const sourceRef = doc(db, 'app_config', 'main');
  const targetRef = doc(db, `users/${uid}/app_config`, 'main');

  const [sourceSnapshot, targetSnapshot] = await Promise.all([getDoc(sourceRef), getDoc(targetRef)]);
  if (!sourceSnapshot.exists()) {
    return { migrated: false, reason: 'legacy app_config/main not found' };
  }

  const sourceData = sourceSnapshot.data();
  const targetData = targetSnapshot.exists() ? targetSnapshot.data() : {};

  // Keep newer per-user changes, only backfill missing values from legacy.
  const mergedData = deepMerge(sourceData, targetData);
  const hasChanges = JSON.stringify(mergedData) !== JSON.stringify(targetData);

  if (!hasChanges) {
    return { migrated: false, reason: 'target app_config already up to date' };
  }

  if (!dryRun) {
    const batch = writeBatch(db);
    batch.set(targetRef, mergedData, { merge: true });
    await batch.commit();
  }

  return { migrated: true, reason: dryRun ? 'dry-run' : 'written' };
};

const migrateCollection = async ({
  uid,
  sourceCollection,
  targetCollection,
  withOwnerId = false,
  dryRun
}) => {
  const sourceSnapshot = await getDocs(query(collection(db, sourceCollection)));
  if (sourceSnapshot.empty) {
    return { sourceCount: 0, copiedCount: 0, skippedCount: 0, writes: 0 };
  }

  const targetSnapshot = await getDocs(query(collection(db, targetCollection)));
  const targetIds = new Set(targetSnapshot.docs.map((item) => item.id));

  const toCopy = sourceSnapshot.docs
    .filter((item) => !targetIds.has(item.id))
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        data: withOwnerId ? { ...data, ownerId: uid } : data
      };
    });

  if (!dryRun) {
    const chunks = chunkArray(toCopy, MAX_BATCH_SIZE);
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        const targetRef = doc(db, targetCollection, item.id);
        batch.set(targetRef, item.data, { merge: true });
      });
      await batch.commit();
    }
  }

  return {
    sourceCount: sourceSnapshot.size,
    copiedCount: toCopy.length,
    skippedCount: sourceSnapshot.size - toCopy.length,
    writes: dryRun ? 0 : toCopy.length
  };
};

const migrateForUid = async ({ uid, dryRun, includeCommunity }) => {
  const appConfigResult = await migrateAppConfig({ uid, dryRun });
  const petsResult = await migrateCollection({
    uid,
    sourceCollection: 'pets',
    targetCollection: `users/${uid}/pets`,
    withOwnerId: true,
    dryRun
  });

  const journalResult = await migrateCollection({
    uid,
    sourceCollection: 'journalEntries',
    targetCollection: `users/${uid}/journalEntries`,
    withOwnerId: true,
    dryRun
  });

  let communityResult = null;
  if (includeCommunity) {
    communityResult = await migrateCollection({
      uid,
      sourceCollection: 'communityPosts',
      targetCollection: `users/${uid}/communityPosts`,
      withOwnerId: true,
      dryRun
    });
  }

  return {
    uid,
    appConfig: appConfigResult,
    pets: petsResult,
    journalEntries: journalResult,
    communityPosts: communityResult
  };
};

const run = async () => {
  const options = parseArgs();

  // eslint-disable-next-line no-console
  console.log('Starting legacy migration with options:', options);

  const targetUids = Array.from(new Set((await resolveTargetUids(options)).filter(Boolean)));
  if (targetUids.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No target uid found. Nothing to migrate.');
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Found ${targetUids.length} user(s) to migrate.`);

  const reports = [];
  for (const uid of targetUids) {
    // eslint-disable-next-line no-console
    console.log(`Migrating uid=${uid} ...`);

    const result = await migrateForUid({
      uid,
      dryRun: options.dryRun,
      includeCommunity: options.includeCommunity
    });
    reports.push(result);

    // eslint-disable-next-line no-console
    console.log(`- uid=${uid} app_config/main:`, result.appConfig);
    // eslint-disable-next-line no-console
    console.log(`- uid=${uid} pets:`, result.pets);
    // eslint-disable-next-line no-console
    console.log(`- uid=${uid} journalEntries:`, result.journalEntries);
    if (result.communityPosts) {
      // eslint-disable-next-line no-console
      console.log(`- uid=${uid} communityPosts (optional):`, result.communityPosts);
    }
  }

  const totals = reports.reduce(
    (acc, item) => {
      acc.users += 1;
      acc.petsCopied += item.pets.copiedCount;
      acc.journalCopied += item.journalEntries.copiedCount;
      if (item.communityPosts) {
        acc.communityCopied += item.communityPosts.copiedCount;
      }
      return acc;
    },
    {
      users: 0,
      petsCopied: 0,
      journalCopied: 0,
      communityCopied: 0
    }
  );

  // eslint-disable-next-line no-console
  console.log('Migration totals:', totals);
  // eslint-disable-next-line no-console
  console.log(options.dryRun ? 'Dry-run completed.' : 'Migration completed.');
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', error);
  process.exit(1);
});
