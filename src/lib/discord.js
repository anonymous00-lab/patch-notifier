// Discord Bot Delivery Engine

/**
 * Ensures a URL is absolute. Discord rejects relative URLs.
 */
function makeAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith('/')) {
    // For local development, prepend a placeholder domain so Discord accepts the format
    // In production, this should be the actual app URL
    return 'https://patchbot.io' + url;
  }
  return url;
}

/**
 * Prepares the Discord embed payload for a patch note.
 * Returns a complete Discord message object.
 */
export function formatPatchNoteEmbed(patchNote, game) {
  const isDemo = patchNote.title.includes('DEMO');

  const embed = {
    title: patchNote.title,
    description: patchNote.content ? patchNote.content.substring(0, 4000) : (patchNote.summary || 'Nessun dettaglio disponibile.'),
    color: parseInt((game.embed_color || '#5865F2').replace('#', ''), 16),
    timestamp: isDemo ? new Date().toISOString() : (patchNote.published_at || new Date().toISOString()),
    author: {
      name: game.name || 'Patch Notifier',
    },
    footer: {
      text: 'Patch Notifier',
    },
  };

  const iconUrl = makeAbsoluteUrl(game.image_url);
  if (iconUrl) {
    embed.author.icon_url = iconUrl;
  }

  const patchUrl = makeAbsoluteUrl(patchNote.url);
  if (patchUrl) {
    embed.url = patchUrl;
  }

  const patchImageUrl = makeAbsoluteUrl(patchNote.image_url);
  
  // Use game icon as thumbnail always, if available
  if (iconUrl) {
    embed.thumbnail = {
      url: iconUrl,
    };
  }

  // If there's a specific patch image (not the same as the game icon), use it as the main image
  if (patchImageUrl && patchImageUrl !== iconUrl) {
    embed.image = {
      url: patchImageUrl,
    };
  }

  return {
    embeds: [embed],
  };
}

/**
 * Sends a message to a Discord channel using the Bot API.
 * @param {string} channelId - The Discord channel ID
 * @param {Object} payload - The message payload (e.g. from formatPatchNoteEmbed)
 * @param {Object} options - Premium settings { pin_messages, use_threads, mention_roles, thread_name }
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function sendToDiscord(channelId, payload, options = {}) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.error('[Discord] DISCORD_BOT_TOKEN is missing');
    return false;
  }

  // Add Role Mentions
  if (options.mention_roles) {
    payload.content = options.mention_roles + (payload.content ? `\n${payload.content}` : '');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    };

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const msg = await response.json();
      const msgId = msg.id;

      // Pin Message
      if (options.pin_messages) {
        await fetch(`https://discord.com/api/v10/channels/${channelId}/pins/${msgId}`, {
          method: 'PUT',
          headers
        });
      }

      // Create Thread
      if (options.use_threads && options.thread_name) {
        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${msgId}/threads`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: options.thread_name.substring(0, 100) })
        });
      }

      return true;
    } else {
      const errorData = await response.text();
      console.error(`[Discord] Error sending to channel ${channelId}:`, response.status, errorData);
      throw new Error(errorData);
    }
  } catch (error) {
    console.error(`[Discord] Exception sending to channel ${channelId}:`, error);
    throw error;
  }
}
