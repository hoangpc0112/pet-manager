const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const PHOTON_ENDPOINT = 'https://photon.komoot.io/api';
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

const LOCAL_SERVICE_SEEDS = [
  {
    id: 'seed-hcm-vet-1',
    name: 'Happy Paws Veterinary Center',
    type: 'Thú y',
    address: '128 Nguyen Thi Minh Khai, Q.3, TP.HCM',
    latitude: 10.77733,
    longitude: 106.68862,
    rating: '4.8',
    reviewsCount: 214,
    status: 'Đang mở',
    hours: '08:00 - 20:00',
    phone: '02838229999',
    website: 'https://example.com/happy-paws'
  },
  {
    id: 'seed-hcm-shop-1',
    name: 'PetMart Central',
    type: 'Pet shop',
    address: '210 Dien Bien Phu, Q.10, TP.HCM',
    latitude: 10.77438,
    longitude: 106.67685,
    rating: '4.5',
    reviewsCount: 96,
    status: 'Đang mở',
    hours: '08:30 - 22:00',
    phone: '02838339999'
  },
  {
    id: 'seed-hcm-groom-1',
    name: 'Urban Grooming Studio',
    type: 'Grooming',
    address: '52 Truong Sa, Binh Thanh, TP.HCM',
    latitude: 10.80002,
    longitude: 106.70645,
    rating: '4.6',
    reviewsCount: 128,
    status: 'Đang mở',
    hours: '09:00 - 21:00',
    phone: '02838449999'
  },
  {
    id: 'seed-hcm-stay-1',
    name: 'Pet Hotel Riverside',
    type: 'Luu tru',
    address: '18 Nguyen Huu Canh, Binh Thanh, TP.HCM',
    latitude: 10.79045,
    longitude: 106.72047,
    rating: '4.6',
    reviewsCount: 74,
    status: 'Sắp đóng cửa',
    hours: '07:00 - 19:00',
    website: 'https://example.com/pet-hotel-riverside'
  }
];

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (value) => (value * Math.PI) / 180;

const haversineMeters = (from, to) => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters) || meters < 0) return 'Chưa rõ khoảng cách';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${url}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const mapServiceType = (tags = {}) => {
  if (tags.amenity === 'veterinary') return 'Thú y';
  if (tags.amenity === 'animal_boarding') return 'Lưu trú';
  if (tags.shop === 'pet') return 'Pet shop';
  if (tags.shop === 'pet_grooming' || tags.grooming === 'yes') return 'Grooming';
  return 'Dịch vụ thú cưng';
};

const mapServiceTypeFromText = (value = '') => {
  const text = String(value).toLowerCase();
  if (text.includes('veterinary') || text.includes('vet')) return 'Thú y';
  if (text.includes('boarding') || text.includes('hotel')) return 'Lưu trú';
  if (text.includes('groom') || text.includes('spa')) return 'Grooming';
  if (text.includes('pet') || text.includes('shop')) return 'Pet shop';
  return 'Dịch vụ thú cưng';
};

const pickFirstTagValue = (tags = {}, keys = []) => {
  for (const key of keys) {
    const value = tags[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const toRating = (tags = {}) => {
  const raw = pickFirstTagValue(tags, ['stars', 'rating']);
  if (!raw) return undefined;

  const parsed = Number.parseFloat(raw.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed.toFixed(1);
};

const toReviewsCount = (tags = {}) => {
  const raw = pickFirstTagValue(tags, ['rating:count']);
  if (!raw) return undefined;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
};

const toAddress = (tags = {}) => {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] || tags['addr:province']
  ].filter(Boolean);

  if (parts.length === 0) return pickFirstTagValue(tags, ['addr:full', 'description']);

  return parts.join(', ');
};

const createBaseItem = ({
  id,
  name,
  type,
  latitude,
  longitude,
  distanceMeters,
  source,
  sourceId,
  sourceType,
  mapUrl,
  address,
  hours,
  status,
  phone,
  website,
  email,
  operator,
  description,
  postcode,
  city,
  province,
  country,
  rating,
  reviewsCount
}) => ({
  id,
  name,
  type,
  distance: formatDistance(distanceMeters),
  distanceMeters,
  address,
  hours,
  status,
  phone,
  website,
  email,
  operator,
  description,
  postcode,
  city,
  province,
  country,
  rating,
  reviewsCount,
  source,
  sourceId,
  sourceType,
  mapUrl,
  latitude,
  longitude,
  services: [],
  reviews: []
});

const normalizeOverpassElement = (element, userLocation) => {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const tags = element.tags || {};
  const distanceMeters = haversineMeters(userLocation, { latitude, longitude });
  const phone = pickFirstTagValue(tags, ['phone', 'contact:phone']);
  const website = pickFirstTagValue(tags, ['website', 'contact:website']);
  const email = pickFirstTagValue(tags, ['email', 'contact:email']);
  const operator = pickFirstTagValue(tags, ['operator', 'brand']);
  const description = pickFirstTagValue(tags, ['description']);
  const hours = pickFirstTagValue(tags, ['opening_hours']);
  const address = toAddress(tags);
  const rating = toRating(tags);
  const reviewsCount = toReviewsCount(tags);
  const postcode = pickFirstTagValue(tags, ['addr:postcode']);
  const city = pickFirstTagValue(tags, ['addr:city', 'addr:town', 'addr:village']);
  const province = pickFirstTagValue(tags, ['addr:province', 'is_in:state']);
  const country = pickFirstTagValue(tags, ['addr:country']);
  const mapUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;

  return createBaseItem({
    id: `osm-${element.type}-${element.id}`,
    name: tags.name || 'Dịch vụ thú cưng gần bạn',
    type: mapServiceType(tags),
    status: hours ? 'Có giờ mở cửa' : undefined,
    distanceMeters,
    address,
    hours,
    rating,
    reviewsCount,
    phone: phone || undefined,
    website: website || undefined,
    email: email || undefined,
    operator: operator || undefined,
    description: description || undefined,
    postcode: postcode || undefined,
    city: city || undefined,
    province: province || undefined,
    country: country || undefined,
    source: 'OpenStreetMap/Overpass',
    sourceId: String(element.id),
    sourceType: element.type,
    mapUrl,
    latitude,
    longitude
  });
};

const normalizePhotonFeature = (feature, userLocation) => {
  const [longitude, latitude] = feature?.geometry?.coordinates || [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const props = feature?.properties || {};
  const name = props.name || props.street || 'Dịch vụ thú cưng gần bạn';
  const typeSource = [props.osm_key, props.osm_value, props.category, props.type].filter(Boolean).join(' ');
  const distanceMeters = haversineMeters(userLocation, { latitude, longitude });
  const addressParts = [props.housenumber, props.street, props.city, props.state, props.country].filter(Boolean);

  return createBaseItem({
    id: `photon-${props.osm_type || 'feature'}-${props.osm_id || name}`,
    name,
    type: mapServiceTypeFromText(typeSource),
    distanceMeters,
    address: addressParts.join(', ') || undefined,
    postcode: props.postcode || undefined,
    city: props.city || undefined,
    province: props.state || undefined,
    country: props.country || undefined,
    source: 'Photon',
    sourceId: props.osm_id ? String(props.osm_id) : undefined,
    sourceType: props.osm_type || 'feature',
    mapUrl: props.osm_id ? `https://www.openstreetmap.org/${props.osm_type || 'node'}/${props.osm_id}` : undefined,
    latitude,
    longitude
  });
};

const normalizeNominatimItem = (item, userLocation) => {
  const latitude = Number.parseFloat(item?.lat);
  const longitude = Number.parseFloat(item?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const distanceMeters = haversineMeters(userLocation, { latitude, longitude });
  const tagsText = [item?.type, item?.class, item?.category].filter(Boolean).join(' ');
  const address = item?.display_name || undefined;
  const details = item?.address || {};

  return createBaseItem({
    id: `nominatim-${item.osm_type || 'item'}-${item.osm_id || Math.round(distanceMeters)}`,
    name: item?.name || details.amenity || details.shop || 'Dịch vụ thú cưng gần bạn',
    type: mapServiceTypeFromText(tagsText),
    distanceMeters,
    address,
    postcode: details.postcode || undefined,
    city: details.city || details.town || details.village || undefined,
    province: details.state || undefined,
    country: details.country || undefined,
    source: 'OpenStreetMap/Nominatim',
    sourceId: item.osm_id ? String(item.osm_id) : undefined,
    sourceType: item.osm_type || 'item',
    mapUrl: item.osm_type && item.osm_id ? `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}` : undefined,
    latitude,
    longitude
  });
};

const dedupeServices = (items) => {
  const seen = new Set();
  const merged = [];

  items.forEach((item) => {
    const key = `${String(item.name || '').toLowerCase()}-${Math.round((item.latitude || 0) * 1000)}-${Math.round((item.longitude || 0) * 1000)}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
};

const fetchOverpassServices = async ({ latitude, longitude, radiusMeters }) => {
  const query = `[out:json][timeout:12];\n(\n  node(around:${radiusMeters},${latitude},${longitude})["amenity"="veterinary"];\n  way(around:${radiusMeters},${latitude},${longitude})["amenity"="veterinary"];\n  node(around:${radiusMeters},${latitude},${longitude})["shop"="pet"];\n  way(around:${radiusMeters},${latitude},${longitude})["shop"="pet"];\n  node(around:${radiusMeters},${latitude},${longitude})["amenity"="animal_boarding"];\n  way(around:${radiusMeters},${latitude},${longitude})["amenity"="animal_boarding"];\n  node(around:${radiusMeters},${latitude},${longitude})["shop"="pet_grooming"];\n  way(around:${radiusMeters},${latitude},${longitude})["shop"="pet_grooming"];\n);\nout center tags;`;

  let payload = null;
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      payload = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: query
        },
        12000
      );
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!payload) {
    throw lastError || new Error('Unable to fetch Overpass services');
  }

  const elements = Array.isArray(payload?.elements) ? payload.elements : [];
  const userLocation = { latitude, longitude };

  return elements.map((element) => normalizeOverpassElement(element, userLocation)).filter(Boolean);
};

const fetchPhotonServices = async ({ latitude, longitude, maxResults }) => {
  const userLocation = { latitude, longitude };
  const keywords = ['veterinary', 'pet', 'pet shop', 'pet grooming', 'animal boarding'];

  const requests = keywords.map((keyword) => {
    const params = new URLSearchParams({
      q: keyword,
      lat: String(latitude),
      lon: String(longitude),
      limit: '12'
    });
    return fetchWithTimeout(`${PHOTON_ENDPOINT}/?${params.toString()}`, {}, 10000);
  });

  const results = await Promise.allSettled(requests);
  const features = results
    .filter((entry) => entry.status === 'fulfilled')
    .flatMap((entry) => (Array.isArray(entry.value?.features) ? entry.value.features : []));

  return dedupeServices(features.map((feature) => normalizePhotonFeature(feature, userLocation)).filter(Boolean)).slice(0, maxResults);
};

const getBoundingBox = (latitude, longitude, radiusMeters) => {
  const deltaLat = radiusMeters / 111320;
  const deltaLon = radiusMeters / (111320 * Math.max(0.2, Math.cos(toRadians(latitude))));

  return {
    left: longitude - deltaLon,
    right: longitude + deltaLon,
    top: latitude + deltaLat,
    bottom: latitude - deltaLat
  };
};

const fetchNominatimServices = async ({ latitude, longitude, radiusMeters, maxResults }) => {
  const bbox = getBoundingBox(latitude, longitude, radiusMeters);
  const userLocation = { latitude, longitude };
  const queries = ['veterinary', 'pet shop', 'pet grooming', 'animal boarding'];

  const requests = queries.map((keyword) => {
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: keyword,
      limit: '20',
      addressdetails: '1',
      extratags: '1',
      bounded: '1',
      viewbox: `${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}`
    });

    return fetchWithTimeout(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {}, 10000);
  });

  const responses = await Promise.allSettled(requests);
  const items = responses
    .filter((entry) => entry.status === 'fulfilled')
    .flatMap((entry) => (Array.isArray(entry.value) ? entry.value : []));

  return dedupeServices(items.map((item) => normalizeNominatimItem(item, userLocation)).filter(Boolean)).slice(0, maxResults);
};

const sortByDistance = (items, userLocation) =>
  [...items]
    .map((item) => {
      const distanceMeters = haversineMeters(userLocation, {
        latitude: item.latitude,
        longitude: item.longitude
      });

      return {
        ...item,
        distanceMeters,
        distance: formatDistance(distanceMeters)
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

export const getSeedNearbyServicesByLocation = (userLocation, maxResults = 10) => {
  if (!userLocation) {
    return LOCAL_SERVICE_SEEDS.slice(0, maxResults).map((item, index) => ({
      ...item,
      distanceMeters: Number.POSITIVE_INFINITY,
      distance: `${index + 1} km`,
      operator: item.operator || undefined,
      email: item.email || undefined,
      description: item.description || undefined,
      source: 'Seed data',
      sourceId: item.id,
      sourceType: 'seed',
      mapUrl: item.mapUrl || undefined,
      services: [],
      reviews: []
    }));
  }

  return sortByDistance(LOCAL_SERVICE_SEEDS, userLocation)
    .slice(0, maxResults)
    .map((item) => ({ ...item, services: [], reviews: [] }));
};

export const fetchNearbyServicesByLocation = async ({
  latitude,
  longitude,
  radiusMeters = 5000,
  maxResults = 10
}) => {
  const fetchers = [
    fetchOverpassServices({ latitude, longitude, radiusMeters }),
    fetchPhotonServices({ latitude, longitude, maxResults }),
    fetchNominatimServices({ latitude, longitude, radiusMeters, maxResults })
  ];

  const settled = await Promise.allSettled(fetchers);
  const collected = settled
    .filter((item) => item.status === 'fulfilled')
    .flatMap((item) => item.value || []);

  if (collected.length === 0) {
    throw new Error('Unable to fetch nearby services from free data sources');
  }

  return dedupeServices(collected)
    .sort((a, b) => (a.distanceMeters || Number.MAX_SAFE_INTEGER) - (b.distanceMeters || Number.MAX_SAFE_INTEGER))
    .slice(0, maxResults);
};
