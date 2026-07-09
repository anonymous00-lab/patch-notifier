require('dotenv').config({ path: '.env.local' });
const token = process.env.DISCORD_BOT_TOKEN;
const targetGuildId = '1524592023888199952'; // PatchNotifier server

async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `https://discord.com/api/v10${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  
  if (res.status === 204) return null;
  return await res.json();
}

async function setupServer() {
  try {
    console.log(`Setting up exact PatchBot clone for server: ${targetGuildId}`);
    
    // 1. Fetch existing channels
    const channels = await apiCall(`/guilds/${targetGuildId}/channels`);
    
    // 2. Delete existing channels (except community defaults if it fails)
    console.log("Deleting existing channels...");
    for (const channel of channels) {
      try {
        await apiCall(`/channels/${channel.id}`, 'DELETE');
      } catch (e) {
        console.log(`Could not delete channel ${channel.name}`);
      }
    }
    
    // 3. Create Categories & Channels
    console.log("Creating categories and channels...");
    
    // General Category
    const generalCat = await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
      name: 'General',
      type: 4 // GUILD_CATEGORY
    });
    
    const rulesChannel = await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
      name: 'rules',
      type: 0, // GUILD_TEXT
      parent_id: generalCat.id
    });
    
    // Send Welcome Message to rules channel
    const welcomeMessage = `**Welcome to the PatchNotifier Discord server!**

Add the bot and manage your server's game subscriptions at https://patch-notifier.com/ (example link)

- <#$updates> - View a history of the updates we've sent out so you can see what game updates would look like directly in Discord
- <#$vote_for_features> - Use reactions to vote for features to add.
- <#$vote_for_games> - Use reactions to vote for games to add support for. We are only taking requests for PC games at this time.
- <#$announcements> - Details on updates we ship for PatchNotifier that you might be interested in hearing about.`;
    
    // We will send this message at the end once we know all channel IDs.

    // PatchBot Category
    const patchBotCat = await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
      name: 'PatchNotifier', // Using our app name instead of PatchBot
      type: 4
    });
    
    // Announcement channel (requires community enabled, fallback to normal text if not)
    try {
      await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
        name: 'announcements',
        type: 5, // GUILD_ANNOUNCEMENT
        parent_id: patchBotCat.id
      });
    } catch (e) {
      // Fallback if community not enabled
      await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
        name: 'announcements',
        type: 0,
        parent_id: patchBotCat.id
      });
    }
    
    const textChannels = [
      'general',
      'updates',
      'vote-for-games',
      'vote-for-ai',
      'vote-for-content-creation',
      'vote-for-free-stuff',
      'vote-for-features',
      'bug-reports'
    ];
    
    for (const name of textChannels) {
      await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
        name: name,
        type: 0,
        parent_id: patchBotCat.id
      });
    }

    // we-might-die Category
    const wmdCat = await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
      name: 'we-might-die',
      type: 4
    });

    await apiCall(`/guilds/${targetGuildId}/channels`, 'POST', {
      name: 'game-details',
      type: 0,
      parent_id: wmdCat.id
    });
    
    // Fetch all channels to get IDs for the welcome message formatting
    const allNewChannels = await apiCall(`/guilds/${targetGuildId}/channels`);
    const getCh = (name) => allNewChannels.find(c => c.name === name)?.id || '0';
    
    const finalWelcomeMessage = `**Welcome to the PatchNotifier Discord server!**

Add the bot and manage your server's game subscriptions at **https://patch-notifier.com/**

- <#${getCh('updates')}> - View a history of the updates we've sent out so you can see what game updates would look like directly in Discord
- <#${getCh('vote-for-features')}> - Use reactions to vote for features to add.
- <#${getCh('vote-for-games')}> - Use reactions to vote for games to add support for. We are only taking requests for PC games at this time.
- <#${getCh('announcements')}> - Details on updates we ship for PatchNotifier that you might be interested in hearing about.`;

    await apiCall(`/channels/${rulesChannel.id}/messages`, 'POST', {
      content: finalWelcomeMessage
    });
    
    console.log("Server setup complete!");
    
  } catch (error) {
    console.error("Error setting up server:", error);
  }
}

setupServer();
