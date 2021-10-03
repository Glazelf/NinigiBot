const typeNames = {
  GUILD_TEXT: 'Text',
  GUILD_VOICE: 'Voice',
  GUILD_CATEGORY: 'Category',
  GUILD_NEWS: 'News',
  GUILD_STORE: 'Store',
  GUILD_STAGE_VOICE: 'Stage Voice',
  DM: 'DM',
  GROUP_DM: 'Group DM',
  GUILD_NEWS_THREAD: 'News Thread',
  GUILD_PRIVATE_THREAD: 'Private Thread',
  GUILD_PUBLIC_THREAD: 'Public Thread',
  UNKNOWN: 'Unknown'
};

module.exports = (channel) => {
  if (!channel) throw new Error('channel cannot be undefined or empty');
  return typeNames[channel.type] ?? 'Unknown';
};