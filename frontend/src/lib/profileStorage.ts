const avatarKey = (userId: string) => `anteiku-avatar:${userId}`;

export function getLocalAvatar(userId?: string) {
  if (!userId) return null;
  try { return window.localStorage.getItem(avatarKey(userId)); } catch { return null; }
}

export function setLocalAvatar(userId: string, value: string) {
  try { window.localStorage.setItem(avatarKey(userId), value); } catch { /* storage may be full */ }
}
