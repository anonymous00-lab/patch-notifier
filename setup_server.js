require('dotenv').config({ path: '.env.local' });
const token = process.env.DISCORD_BOT_TOKEN;

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
    // 1. Get guilds the bot is in
    const guilds = await apiCall('/users/@me/guilds');
    if (guilds.length === 0) {
      console.error("The bot is not in any servers!");
      return;
    }
    
    // Find the PatchNotifier server
    const guild = guilds.find(g => g.id === '1524592023888199952');
    if (!guild) {
      console.error("The bot is not in the PatchNotifier server!");
      return;
    }
    
    const guildId = guild.id;
    console.log(`Setting up server: ${guild.name} (${guildId})`);
    
    // 2. Fetch existing channels
    const channels = await apiCall(`/guilds/${guildId}/channels`);
    
    // 3. Delete existing channels
    console.log("Deleting existing channels...");
    for (const channel of channels) {
      try {
        await apiCall(`/channels/${channel.id}`, 'DELETE');
      } catch (e) {
        console.log(`Could not delete channel ${channel.name}: ${e.message}`);
      }
    }
    
    // 4. Create new roles
    console.log("Creating roles...");
    await apiCall(`/guilds/${guildId}/roles`, 'POST', {
      name: 'Admin',
      color: 15548997, // Red
      hoist: true,
      permissions: "8" // Administrator
    });
    
    await apiCall(`/guilds/${guildId}/roles`, 'POST', {
      name: 'Moderatore',
      color: 3447003, // Blue
      hoist: true,
    });

    await apiCall(`/guilds/${guildId}/roles`, 'POST', {
      name: 'Patch Notifier Team',
      color: 10181046, // Purple
      hoist: true,
    });
    
    // 5. Create Categories & Channels
    console.log("Creating categories and channels...");
    
    // ANNUNCI Category
    const annunciCat = await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: '📣 ANNUNCI',
      type: 4 // GUILD_CATEGORY
    });
    
    await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: 'patch-notes',
      type: 0, // GUILD_TEXT
      parent_id: annunciCat.id
    });
    
    await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: 'news',
      type: 0,
      parent_id: annunciCat.id
    });
    
    // COMMUNITY Category
    const commCat = await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: '💬 COMMUNITY',
      type: 4
    });
    
    await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: 'chat-generale',
      type: 0,
      parent_id: commCat.id
    });

    await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: 'off-topic',
      type: 0,
      parent_id: commCat.id
    });
    
    // SUPPORTO Category
    const suppCat = await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: '🆘 SUPPORTO',
      type: 4
    });
    
    await apiCall(`/guilds/${guildId}/channels`, 'POST', {
      name: 'aiuto',
      type: 0,
      parent_id: suppCat.id
    });
    
    console.log("Server setup complete!");
    
  } catch (error) {
    console.error("Error setting up server:", error);
  }
}

setupServer();
