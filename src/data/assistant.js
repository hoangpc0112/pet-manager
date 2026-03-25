export const assistantTools = [
  {
    id: 'symptom',
    title: 'Kiểm tra triệu chứng',
    subtitle: 'Đánh giá mức rủi ro',
    icon: 'medkit'
  },
  {
    id: 'nutrition',
    title: 'Trợ lý dinh dưỡng',
    subtitle: 'Khẩu phần và lịch ăn',
    icon: 'restaurant'
  },
  {
    id: 'reminder',
    title: 'Nhắc nhở thông minh',
    subtitle: 'Gợi ý mẫu lịch chăm sóc',
    icon: 'notifications'
  },
  {
    id: 'summary',
    title: 'Tóm tắt thú y',
    subtitle: 'Chuẩn bị trước buổi khám',
    icon: 'document-text'
  }
];

export const pets = [
  { id: 'luna', name: 'Luna', breed: 'Golden Retriever', selected: true },
  { id: 'oliver', name: 'Oliver', breed: 'British Shorthair', selected: false },
  { id: 'mochi', name: 'Mochi', breed: 'Munchkin', selected: false }
];

export const symptomGroups = [
  'Tiêu hóa',
  'Da & lông',
  'Hô hấp',
  'Chấn thương',
  'Hành vi',
  'Khác'
];

export const symptoms = [
  'Nôn',
  'Tiêu chảy',
  'Chán ăn',
  'Mệt mỏi',
  'Ho',
  'Ngứa da'
];

export const symptomMeta = {
  duration: ['< 24h', '1-3 ngày', '> 3 ngày'],
  energy: ['Thấp', 'Bình thường', 'Cao'],
  appetite: ['Giảm', 'Bình thường', 'Tăng']
};

export const resultSteps = [
  'Theo dõi tần suất nôn/tiêu chảy mỗi 4 giờ.',
  'Bổ sung nước và chia nhỏ bữa ăn.',
  'Ghi lại thay đổi năng lượng và khẩu vị.'
];

export const resultWarnings = [
  'Nôn liên tục hoặc có máu.',
  'Mệt lả, bỏ ăn hoàn toàn trên 24 giờ.',
  'Co giật hoặc khó thở.'
];
