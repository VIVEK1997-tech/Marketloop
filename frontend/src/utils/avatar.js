const dicebearBase = 'https://api.dicebear.com/7.x';

export const getProfileImage = (profileImage, fallbackName = 'MarketLoop User') => {
  if (profileImage?.trim()) return profileImage.trim();
  return `${dicebearBase}/initials/svg?seed=${encodeURIComponent(fallbackName)}`;
};

export const getAvatarOptions = (name = 'MarketLoop User') => {
  const safeName = name.trim() || 'MarketLoop User';

  return [
    { id: 'initials', label: 'Initials', url: `${dicebearBase}/initials/svg?seed=${encodeURIComponent(safeName)}` },
    { id: 'bottts', label: 'Robot', url: `${dicebearBase}/bottts/svg?seed=${encodeURIComponent(safeName)}` },
    { id: 'adventurer', label: 'Adventurer', url: `${dicebearBase}/adventurer/svg?seed=${encodeURIComponent(safeName)}` },
    { id: 'micah', label: 'Micah', url: `${dicebearBase}/micah/svg?seed=${encodeURIComponent(safeName)}` },
    { id: 'fun-emoji', label: 'Emoji', url: `${dicebearBase}/fun-emoji/svg?seed=${encodeURIComponent(safeName)}` },
    { id: 'lorelei', label: 'Lorelei', url: `${dicebearBase}/lorelei/svg?seed=${encodeURIComponent(safeName)}` }
  ];
};
