import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp, doc, writeBatch } from 'firebase/firestore';
import 'dotenv/config';

// Seed script for Firestore collections based on the DB diagram.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.fromDate(new Date());

const seedData = {
  users: [
    {
      id: 'user_anna',
      data: {
        email: 'anna@example.com',
        phone_number: '+84123456789',
        auth_provider: 'password',
        display_name: 'Anna Nguyen',
        photo_url: '',
        language: 'vi',
        created_at: now,
        updated_at: now,
        settings: {
          notifications_enabled: true,
          distance_unit: 'km',
          theme: 'light'
        }
      }
    },
    {
      id: 'user_minh',
      data: {
        email: 'minh@example.com',
        phone_number: '+84987654321',
        auth_provider: 'google',
        display_name: 'Minh Tran',
        photo_url: '',
        language: 'vi',
        created_at: now,
        updated_at: now,
        settings: {
          notifications_enabled: true,
          distance_unit: 'km',
          theme: 'system'
        }
      }
    }
  ],
  pets: [
    {
      id: 'pet_mochi',
      data: {
        owner_user_id: 'user_anna',
        name: 'Mochi',
        species: 'dog',
        breed: 'golden',
        gender: 'female',
        birth_date: Timestamp.fromDate(new Date('2021-04-20')),
        age_text: '4 years',
        current_weight: 22.4,
        avatar_media_id: 'media_mochi_avatar',
        is_current_pet: true,
        created_at: now,
        updated_at: now,
        base_profile: {
          species: 'dog',
          breed: 'golden',
          gender: 'female',
          birth_date: Timestamp.fromDate(new Date('2021-04-20')),
          current_weight: 22.4
        },
        extended_profile: {
          allergies: ['chicken'],
          neutered: true,
          identification_marks: 'white spot on chest',
          behavior_notes: 'friendly, energetic',
          activity_level: 'high'
        }
      }
    },
    {
      id: 'pet_sushi',
      data: {
        owner_user_id: 'user_minh',
        name: 'Sushi',
        species: 'cat',
        breed: 'british_shorthair',
        gender: 'male',
        birth_date: Timestamp.fromDate(new Date('2022-08-05')),
        age_text: '2 years',
        current_weight: 4.6,
        avatar_media_id: 'media_sushi_avatar',
        is_current_pet: false,
        created_at: now,
        updated_at: now,
        base_profile: {
          species: 'cat',
          breed: 'british_shorthair',
          gender: 'male',
          birth_date: Timestamp.fromDate(new Date('2022-08-05')),
          current_weight: 4.6
        },
        extended_profile: {
          allergies: [],
          neutered: false,
          identification_marks: 'gray coat',
          behavior_notes: 'calm, indoor',
          activity_level: 'low'
        }
      }
    }
  ],
  activities: [
    {
      id: 'act_1',
      data: {
        pet_id: 'pet_mochi',
        type: 'walk',
        time: Timestamp.fromDate(new Date('2026-04-01T07:30:00Z')),
        duration_minutes: 30,
        note: 'morning walk',
        created_at: now
      }
    },
    {
      id: 'act_2',
      data: {
        pet_id: 'pet_sushi',
        type: 'play',
        time: Timestamp.fromDate(new Date('2026-04-01T13:00:00Z')),
        duration_minutes: 15,
        note: 'laser toy',
        created_at: now
      }
    }
  ],
  vaccinations: [
    {
      id: 'vax_1',
      data: {
        pet_id: 'pet_mochi',
        vaccine_code: 'RABIES',
        vaccine_name: 'Rabies',
        due_date: Timestamp.fromDate(new Date('2026-06-20')),
        done_date: Timestamp.fromDate(new Date('2025-06-20')),
        booster_date: Timestamp.fromDate(new Date('2026-06-20')),
        status: 'scheduled',
        vet_clinic_name: 'Happy Paws Clinic',
        note: 'annual booster',
        created_at: now
      }
    }
  ],
  reminders: [
    {
      id: 'rem_1',
      data: {
        pet_id: 'pet_mochi',
        type: 'feeding',
        enabled: true,
        title: 'Morning meal',
        message: 'feed 1 cup of kibble',
        created_at: now,
        schedule: {
          mode: 'repeat',
          datetime: Timestamp.fromDate(new Date('2026-04-02T01:00:00Z')),
          repeat_rule: 'daily',
          days_of_week: [],
          time_of_day: '08:00'
        }
      }
    }
  ],
  health_logs: [
    {
      id: 'log_1',
      data: {
        pet_id: 'pet_mochi',
        weight: 22.4,
        symptom_text: 'vomited once, low appetite',
        created_at: now,
        note: 'monitor hydration',
        triage_result: {
          level: 'Watch',
          red_flags: ['vomiting'],
          summary: 'observe for 24h',
          next_steps: 'if persists, visit vet',
          source: 'rule_based'
        },
        symptom_normalization: {
          symptoms: ['vomiting', 'low_appetite'],
          duration: '1 day',
          severity: 'mild',
          missing_info_questions: ['any diarrhea?', 'water intake?']
        }
      }
    }
  ],
  media: [
    {
      id: 'media_mochi_avatar',
      data: {
        owner_user_id: 'user_anna',
        pet_id: 'pet_mochi',
        type: 'image',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        public_id: 'pets/mochi/avatar',
        mime_type: 'image/jpeg',
        file_name: 'mochi.jpg',
        created_at: now,
        note: 'profile photo',
        cloudinary_meta: {
          resource_type: 'image',
          format: 'jpg',
          bytes: 123456,
          width: 800,
          height: 800
        }
      }
    },
    {
      id: 'media_sushi_avatar',
      data: {
        owner_user_id: 'user_minh',
        pet_id: 'pet_sushi',
        type: 'image',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        public_id: 'pets/sushi/avatar',
        mime_type: 'image/jpeg',
        file_name: 'sushi.jpg',
        created_at: now,
        note: 'profile photo',
        cloudinary_meta: {
          resource_type: 'image',
          format: 'jpg',
          bytes: 123456,
          width: 800,
          height: 800
        }
      }
    }
  ]
};

const writeCollectionBatch = async (collectionName, items) => {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(db, collectionName, item.id);
    batch.set(ref, item.data, { merge: true });
  });
  await batch.commit();
};

const seed = async () => {
  await writeCollectionBatch('users', seedData.users);
  await writeCollectionBatch('pets', seedData.pets);
  await writeCollectionBatch('activities', seedData.activities);
  await writeCollectionBatch('vaccinations', seedData.vaccinations);
  await writeCollectionBatch('reminders', seedData.reminders);
  await writeCollectionBatch('health_logs', seedData.health_logs);
  await writeCollectionBatch('media', seedData.media);
};

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  });
