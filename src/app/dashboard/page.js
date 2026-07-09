'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [servers, setServers] = useState([]);
  const [games, setGames] = useState([]);
  
  const [activeServerId, setActiveServerId] = useState(null);
  const [activeGameId, setActiveGameId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('pc');
  
  const [channels, setChannels] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [expandedChannelId, setExpandedChannelId] = useState(null);
  
  const [serverRoles, setServerRoles] = useState([]);
  const [mentionDropdownOpen, setMentionDropdownOpen] = useState(null);
  const [mentionSearch, setMentionSearch] = useState('');

  // Fetch initial data (Servers and Games)
  useEffect(() => {
    async function fetchData() {
      try {
        const [serversRes, gamesRes] = await Promise.all([
          fetch('/api/user/servers'),
          fetch('/api/games')
        ]);
        if (serversRes.ok) {
          const s = await serversRes.json();
          setServers(s);
          if (s.length > 0) setActiveServerId(s[0].id);
        } else if (serversRes.status === 401) {
          // Session expired
          router.push('/login');
          return;
        }
        if (gamesRes.ok) {
          const g = await gamesRes.json();
          // Fix: API returns { games: [...] }
          const gamesArray = g.games || [];
          setGames(gamesArray);
          if (gamesArray.length > 0) setActiveGameId(gamesArray[0].id);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    }
    fetchData();
  }, []);

  // Fetch channels and subscriptions when activeServerId changes
  useEffect(() => {
    if (activeServerId) {
      setLoadingChannels(true);
      fetch(`/api/servers/${activeServerId}/channels`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setChannels(data);
          else setChannels(data.channels || []);
        })
        .catch(console.error)
        .finally(() => setLoadingChannels(false));
        
      fetch(`/api/servers/${activeServerId}/roles`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setServerRoles(data);
          else setServerRoles([]);
        })
        .catch(console.error);
        
      fetch(`/api/subscriptions?server_id=${activeServerId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSubscriptions(data);
        })
        .catch(console.error);
    } else {
      setChannels([]);
      setServerRoles([]);
      setSubscriptions([]);
    }
  }, [activeServerId]);

  // When category changes, make sure activeGameId is valid for that category
  useEffect(() => {
    if (games.length === 0) return;
    const filteredGames = games.filter(g => (g.category || 'pc') === activeCategory);
    if (filteredGames.length > 0) {
      // Check if current activeGame is in this category
      const currentActive = filteredGames.find(g => g.id === activeGameId);
      if (!currentActive) {
        setActiveGameId(filteredGames[0].id);
      }
    } else {
      setActiveGameId(null);
    }
  }, [activeCategory, games]);

  const handleAddServer = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent('http://localhost:3000/api/discord/callback');
    if (!clientId || clientId === 'tuo_client_id_qui') {
      alert('Configura il Client ID nel file .env.local!');
      return;
    }
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&redirect_uri=${redirectUri}&response_type=code&scope=bot`;
    window.location.href = discordAuthUrl;
  };

  const handleDeleteServer = async (serverId) => {
    if (!confirm('Sei sicuro di voler rimuovere questo server? Tutti gli aggiornamenti verranno disattivati e dovrai riaggiungere il bot da zero.')) return;
    
    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setServers(prev => prev.filter(s => s.id !== serverId));
        if (activeServerId === serverId) {
          const remaining = servers.filter(s => s.id !== serverId);
          setActiveServerId(remaining.length > 0 ? remaining[0].id : null);
        }
      } else {
        alert('Errore durante la rimozione del server');
      }
    } catch (err) {
      console.error(err);
      alert('Errore di connessione');
    }
  };

  const handleToggle = async (channelId) => {
    const isSubscribed = subscriptions.some(s => s.channel_id === channelId && s.game_id === activeGameId);
    const action = isSubscribed ? 'unsubscribe' : 'subscribe';
    
    // Optimistic update
    if (isSubscribed) {
      setSubscriptions(prev => prev.filter(s => !(s.channel_id === channelId && s.game_id === activeGameId)));
    } else {
      setSubscriptions(prev => [...prev, { server_id: activeServerId, channel_id: channelId, game_id: activeGameId }]);
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: activeServerId,
          channelId,
          gameId: activeGameId,
          action
        })
      });
      if (!res.ok) {
        // Revert on error (could be added for robustness)
        console.error('Toggle failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestWebhook = async (channelId) => {
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: activeServerId,
          channelId,
          gameId: activeGameId
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        const apiError = errorData.error || 'Errore Sconosciuto';
        // Parse discord error if it's JSON
        let displayError = apiError;
        try {
          const parsed = JSON.parse(apiError);
          if (parsed.message) displayError = parsed.message;
          if (parsed.errors) displayError += '\n\n' + JSON.stringify(parsed.errors, null, 2);
        } catch(e) {}
        
        alert('Errore invio messaggio a Discord:\n' + displayError);
      }
    } catch (err) {
      console.error(err);
      alert('Errore di connessione');
    }
  };

  const handleUpdateSettings = async (channelId, field, value) => {
    // Optimistic update
    setSubscriptions(prev => prev.map(s => {
      if (s.channel_id === channelId && s.game_id === activeGameId) {
        return { ...s, [field]: value };
      }
      return s;
    }));

    const sub = subscriptions.find(s => s.channel_id === channelId && s.game_id === activeGameId);
    if (!sub) return;
    
    const payload = {
      serverId: activeServerId,
      channelId,
      gameId: activeGameId,
      action: 'updateSettings',
      pin_messages: field === 'pin_messages' ? value : sub.pin_messages,
      use_threads: field === 'use_threads' ? value : sub.use_threads,
      mention_roles: field === 'mention_roles' ? value : sub.mention_roles
    };

    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeGame = games.find(g => g.id === activeGameId);

  return (
    <div className="flex h-screen bg-polygonal text-[#dbdee1] overflow-hidden w-full font-sans relative">
      
      {/* 1. SERVERS SIDEBAR (Icon only) */}
      <div className="w-[80px] bg-[#111216]/95 backdrop-blur-md border-r border-white/5 flex flex-col items-center py-4 space-y-4 shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-20">
        <div 
             onClick={() => router.push('/')}
             className="w-12 h-12 rounded-[24px] bg-[#2B2D31] flex items-center justify-center hover:rounded-[16px] hover:bg-[#5865F2] transition-all duration-300 cursor-pointer text-[#DBDEE1] hover:text-white shrink-0"
             title="Home">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
        </div>
        
        <div className="w-8 h-[2px] bg-[#313338] rounded-full shrink-0"></div>

        {servers.map(server => (
          <div 
            key={server.id}
            onClick={() => setActiveServerId(server.id)}
            className="relative group cursor-pointer shrink-0"
            title={server.name}
          >
            {/* Active Indicator */}
            {activeServerId === server.id && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-10 bg-white rounded-r-full"></div>
            )}
            
            <div className={`w-12 h-12 flex items-center justify-center overflow-hidden transition-all duration-300 ${activeServerId === server.id ? 'rounded-[16px]' : 'rounded-[24px] group-hover:rounded-[16px]'} ${server.icon ? '' : 'bg-[#313338] group-hover:bg-[#5865F2]'}`}>
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-lg">{server.name.charAt(0)}</span>
              )}
            </div>
          </div>
        ))}

        <div 
          onClick={handleAddServer}
          className="w-12 h-12 rounded-[24px] bg-[#313338] flex items-center justify-center hover:rounded-[16px] hover:bg-[#23A559] transition-all duration-300 cursor-pointer text-[#23A559] hover:text-white shrink-0"
          title="Add Server"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        </div>
      </div>

      {/* 2. GAMES SIDEBAR */}
      <div className="w-[300px] bg-[#191b26]/90 backdrop-blur-md flex flex-col shrink-0 border-r border-white/5 shadow-xl z-10">
        
        {/* CATEGORY SELECTOR */}
        <div className="p-4 bg-[#141620]/80 shadow-sm z-10 shrink-0 border-b border-white/5">
          <div className="text-[10px] font-bold text-center text-[#949BA4] mb-3 uppercase tracking-widest">Cambia Categoria</div>
          <div className="flex justify-between items-center px-2 relative">
            <button 
              onClick={() => setActiveCategory('pc')}
              className={`relative p-2 rounded-lg transition-colors group ${activeCategory === 'pc' ? 'text-white' : 'text-[#80848E] hover:text-white hover:bg-[#35373C]'}`}
              title="Giochi per PC"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 3.5l10.5-1.5v9h-10.5v-7.5zM14 1.8l9.5-1.3v10.5h-9.5v-9.2zM2.5 12h10.5v7.5l-10.5-1.5v-6zM14 12h9.5v10.5l-9.5-1.3v-9.2z"/></svg>
              {activeCategory === 'pc' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
            </button>
            <button 
              onClick={() => setActiveCategory('free')}
              className={`relative p-2 rounded-lg transition-colors group ${activeCategory === 'free' ? 'text-white' : 'text-[#80848E] hover:text-white hover:bg-[#35373C]'}`}
              title="Cose Gratis"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 9V7C20 5.89543 19.1046 5 18 5H15.8284C15.9389 4.68656 16 4.35031 16 4C16 1.79086 14.2091 0 12 0C9.79086 0 8 1.79086 8 4C8 4.35031 8.06112 4.68656 8.17157 5H6C4.89543 5 4 5.89543 4 7V9H3V11H4V22H20V11H21V9H20ZM12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2ZM6 7H18V9H6V7ZM6 11H11V20H6V11ZM13 11H18V20H13V11Z"/></svg>
              {activeCategory === 'free' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
            </button>
            <button 
              onClick={() => setActiveCategory('hardware')}
              className={`relative p-2 rounded-lg transition-colors group ${activeCategory === 'hardware' ? 'text-white' : 'text-[#80848E] hover:text-white hover:bg-[#35373C]'}`}
              title="Conducenti (Driver)"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H20C21.1 6 22 6.9 22 8V16C22 17.1 21.1 18 20 18H4C2.9 18 2 17.1 2 16V8C2 6.9 2.9 6 4 6ZM4 16H20V8H4V16ZM6 10H8V14H6V10ZM10 10H18V14H10V10Z"/></svg>
              {activeCategory === 'hardware' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
            </button>
            <button 
              onClick={() => setActiveCategory('ai')}
              className={`relative p-2 rounded-lg transition-colors group ${activeCategory === 'ai' ? 'text-white' : 'text-[#80848E] hover:text-white hover:bg-[#35373C]'}`}
              title="Intelligenza Artificiale"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4V5H18C19.1 5 20 5.9 20 7V17C20 18.1 19.1 19 18 19H17V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V19H6C4.9 19 4 18.1 4 17V7C4 5.9 4.9 5 6 5H10V4C10 2.9 10.9 2 12 2ZM18 7H6V17H18V7ZM9 10C9.6 10 10 10.4 10 11C10 11.6 9.6 12 9 12C8.4 12 8 11.6 8 11C8 10.4 8.4 10 9 10ZM15 10C15.6 10 16 10.4 16 11C16 11.6 15.6 12 15 12C14.4 12 14 11.6 14 11C14 10.4 14.4 10 15 10ZM8 14H16V15C16 16.1 15.1 17 14 17H10C8.9 17 8 16.1 8 15V14Z"/></svg>
              {activeCategory === 'ai' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {games.filter(g => (g.category || 'pc') === activeCategory).map(game => {
            const isActive = activeGameId === game.id;
            return (
              <div 
                key={game.id}
                onClick={() => setActiveGameId(game.id)}
                className={`flex items-center p-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-[#2a2d3d]/80 text-white shadow-lg border-l-4 border-[#F57C00]' : 'hover:bg-[#252837]/80 text-[#949BA4] hover:text-[#DBDEE1]'}`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#141620] shrink-0 mr-3 shadow-md">
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">{game.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{game.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN AREA: SERVER & CHANNELS */}
      <div className="flex-1 bg-transparent flex flex-col min-w-0 relative z-0">
        
        {/* Top Header */}
        <div className="h-14 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 shadow-sm z-10 w-full">
          {activeServer && activeGame ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="font-semibold text-[16px] text-white flex items-center">
                <span className="text-[#949BA4] mr-2">#</span>
                {activeServer.name} <span className="mx-2 text-[#949BA4]">&rsaquo;</span> {activeGame.name}
              </h1>
              <button 
                onClick={() => handleDeleteServer(activeServer.id)}
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                title="Rimuovi Server"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Rimuovi Server
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <h1 className="font-semibold text-white">PatchNotifier Dashboard</h1>
              {activeServer && (
                <button 
                  onClick={() => handleDeleteServer(activeServer.id)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Rimuovi Server"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Rimuovi Server
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {servers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-[#5865F2]/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Configura il tuo primo Server!</h2>
              <p className="text-[#949BA4] text-lg max-w-md mb-8">Per iniziare a ricevere gli aggiornamenti in tempo reale, devi prima aggiungere il bot al tuo server Discord.</p>
              <button 
                onClick={handleAddServer}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)] hover:-translate-y-1 transition-all duration-300"
              >
                Aggiungi a Discord
              </button>
            </div>
          ) : (!activeServer || !activeGame) ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Welcome to PatchNotifier!</h2>
              <p className="text-[#949BA4]">Seleziona un Server e un Gioco dalle colonne di sinistra per configurare i canali.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full pt-4">
              
              {/* Game Banner Header */}
              <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8 shadow-2xl ring-1 ring-white/10 group">
                {activeGame.banner_url || activeGame.image_url ? (
                  <img src={activeGame.banner_url || activeGame.image_url} alt={activeGame.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-[#111216] flex items-center justify-center">
                    <span className="text-4xl font-bold opacity-30">{activeGame.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h1 className="text-4xl font-black text-white drop-shadow-md mb-2">{activeGame.name}</h1>
                  <p className="text-[#DBDEE1] text-sm max-w-xl line-clamp-2">{activeGame.description}</p>
                </div>
              </div>

              {/* Channels List */}
              <div className="bg-[#1a1c27]/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl ring-1 ring-white/5 border border-white/5">
                <h3 className="text-[12px] font-bold text-[#F57C00] uppercase mb-4 tracking-wider">Canali Testuali</h3>
                
                {loadingChannels ? (
                  <div className="text-center py-8 text-[#949BA4]">Caricamento canali in corso...</div>
                ) : channels.length === 0 ? (
                  <div className="text-center py-8 text-[#949BA4]">Nessun canale testuale trovato in questo server.</div>
                ) : (
                  <div className="space-y-[2px]">
                    {channels.map(channel => {
                      const subscription = subscriptions.find(s => s.channel_id === channel.id && s.game_id === activeGame.id);
                      const isSubscribed = !!subscription;
                      const isExpanded = expandedChannelId === channel.id;

                      return (
                        <div key={channel.id} className="flex flex-col bg-transparent border-b border-white/5 last:border-0">
                          <div className="flex items-center justify-between p-3 hover:bg-[#252837]/50 rounded-lg transition-colors group">
                            <div className="flex items-center text-[#DBDEE1] group-hover:text-white font-medium">
                              <span className="text-[#949BA4] mr-2 text-xl leading-none">#</span>
                              {channel.name}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Invia ultima patch (Test Button) */}
                              {isSubscribed && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleTestWebhook(channel.id); }}
                                  title="Invia ultima patch"
                                  className="hidden md:flex bg-[#2B2D31] hover:bg-[#35373C] text-[#DBDEE1] px-3 py-1.5 rounded-xl transition-colors items-center gap-1.5 text-xs font-semibold shadow-sm border border-white/5"
                                >
                                  <svg className="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                  TEST
                                </button>
                              )}

                              {/* Configura Button */}
                              {isSubscribed && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedChannelId(isExpanded ? null : channel.id); }}
                                  className={`flex px-3 py-1.5 rounded-xl transition-all duration-300 items-center gap-1.5 text-xs font-semibold shadow-sm border ${isExpanded ? 'bg-[#5865F2] text-white border-[#5865F2]' : 'bg-[#2B2D31] hover:bg-[#35373C] text-[#DBDEE1] border-white/5'}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {isExpanded ? 'CHIUDI' : 'CONFIGURA'}
                                </button>
                              )}

                              {/* Beautiful Toggle Switch */}
                              <label className="relative inline-flex items-center cursor-pointer ml-2">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={isSubscribed}
                                  onChange={() => handleToggle(channel.id)}
                                />
                                <div className={`w-12 h-6 rounded-full peer-focus:outline-none transition-all duration-300 shadow-inner ${isSubscribed ? 'bg-[#23A559] shadow-[0_0_15px_rgba(35,165,89,0.4)]' : 'bg-[#313338]'}`}>
                                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-300 flex items-center justify-center shadow-sm ${isSubscribed ? 'translate-x-6 border-white' : ''}`}>
                                    {isSubscribed && (
                                      <svg className="w-3.5 h-3.5 text-[#23A559]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    )}
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Settings Panel */}
                          {isExpanded && isSubscribed && (
                            <div className="p-6 bg-black/30 rounded-3xl mt-3 mb-6 mx-2 border border-white/5 space-y-4 shadow-2xl backdrop-blur-xl">
                              <h4 className="text-[13px] font-bold text-[#5865F2] uppercase tracking-wider flex items-center gap-2 mb-4">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.55 13.97L22 9.24L14.81 8.63L12 2Z"/></svg>
                                Impostazioni Canale
                              </h4>
                              
                              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1d202d]/80 border border-white/5">
                                <div className="text-sm font-medium text-[#DBDEE1]">📌 Aggiornamenti dei Pin</div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={!!subscription.pin_messages} onChange={(e) => handleUpdateSettings(channel.id, 'pin_messages', e.target.checked)} />
                                  <div className="w-9 h-5 rounded-full peer-focus:outline-none transition-colors duration-300 bg-[#80848E] peer-checked:bg-[#5865F2]">
                                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform duration-300 flex items-center justify-center ${!!subscription.pin_messages ? 'translate-x-full border-white' : ''}`}>
                                      {!!subscription.pin_messages && (
                                        <svg className="w-3 h-3 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1d202d]/80 border border-white/5">
                                <div className="text-sm font-medium text-[#DBDEE1]">💬 Utilizzare i Thread</div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={!!subscription.use_threads} onChange={(e) => handleUpdateSettings(channel.id, 'use_threads', e.target.checked)} />
                                  <div className="w-9 h-5 rounded-full peer-focus:outline-none transition-colors duration-300 bg-[#80848E] peer-checked:bg-[#5865F2]">
                                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform duration-300 flex items-center justify-center ${!!subscription.use_threads ? 'translate-x-full border-white' : ''}`}>
                                      {!!subscription.use_threads && (
                                        <svg className="w-3 h-3 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              </div>

                              {/* Beautiful Role Mention Input */}
                              <div className="flex flex-col p-5 rounded-2xl bg-[#1d202d]/80 border border-white/5 relative mt-4 transition-all hover:bg-[#1d202d]">
                                <div className="text-sm font-semibold text-white mb-3">@ Menziona Ruoli</div>
                                
                                <div 
                                  className="min-h-[52px] bg-[#111216] border border-white/10 rounded-xl p-2.5 flex flex-wrap gap-2 items-center cursor-text transition-all duration-300 focus-within:border-[#5865F2] focus-within:ring-2 focus-within:ring-[#5865F2]/20"
                                  onClick={() => document.getElementById(`role-input-${channel.id}`)?.focus()}
                                >
                                  {/* Render Pills */}
                                  {(subscription.mention_roles || '').match(/<@&(\d+)>/g)?.map(mention => {
                                    const roleId = mention.replace(/<@&|>/g, '');
                                    const role = serverRoles.find(r => r.id === roleId);
                                    if (!role) return null;
                                    return (
                                      <span key={roleId} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2B2D31] border border-white/10 text-sm font-medium text-white shadow-sm hover:border-white/20 transition-colors">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99AAB5' }}></div>
                                        {role.name}
                                        <button 
                                          className="ml-1 text-[#949BA4] hover:text-red-400 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newVal = (subscription.mention_roles || '').replace(mention, '').trim();
                                            handleUpdateSettings(channel.id, 'mention_roles', newVal);
                                          }}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                      </span>
                                    );
                                  })}

                                  <div className="relative flex-1 min-w-[140px]">
                                    <input 
                                      id={`role-input-${channel.id}`}
                                      type="text" 
                                      className="bg-transparent border-none text-white text-sm focus:ring-0 w-full p-1 outline-none placeholder-[#6b7280]" 
                                      placeholder="Cerca un ruolo (@)..."
                                      value={mentionSearch}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setMentionSearch(val);
                                        if (val.length > 0 || val.startsWith('@')) {
                                          setMentionDropdownOpen(channel.id);
                                        } else {
                                          setMentionDropdownOpen(null);
                                        }
                                      }}
                                      onFocus={() => {
                                        if (serverRoles.length > 0) setMentionDropdownOpen(channel.id);
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          if (mentionDropdownOpen === channel.id) {
                                            setMentionDropdownOpen(null);
                                            setMentionSearch('');
                                          }
                                        }, 200);
                                      }}
                                    />
                                    
                                    {mentionDropdownOpen === channel.id && serverRoles.length > 0 && (
                                      <div className="absolute z-50 left-0 top-full mt-3 w-[280px] max-h-64 overflow-y-auto bg-[#2B2D31] border border-white/10 rounded-2xl shadow-2xl custom-scrollbar py-2 backdrop-blur-xl">
                                        {serverRoles
                                          .filter(r => r.name.toLowerCase().includes(mentionSearch.replace('@', '').toLowerCase()))
                                          .map(role => (
                                          <div 
                                            key={role.id} 
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#35373C] cursor-pointer transition-colors text-sm"
                                            onClick={() => {
                                              const currentMentions = subscription.mention_roles || '';
                                              const roleMention = `<@&${role.id}>`;
                                              if (!currentMentions.includes(roleMention)) {
                                                handleUpdateSettings(channel.id, 'mention_roles', `${currentMentions} ${roleMention}`.trim());
                                              }
                                              setMentionDropdownOpen(null);
                                              setMentionSearch('');
                                            }}
                                          >
                                            <div className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-black/20" style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99AAB5' }}></div>
                                            <span className="text-white font-medium">{role.name}</span>
                                          </div>
                                        ))}
                                        {serverRoles.filter(r => r.name.toLowerCase().includes(mentionSearch.replace('@', '').toLowerCase())).length === 0 && (
                                          <div className="px-4 py-4 text-sm text-[#949BA4] text-center italic">Nessun ruolo trovato</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[12px] text-[#949BA4] mt-3 ml-1">Seleziona i ruoli che vuoi far pingare (menzionare) automaticamente ad ogni nuovo aggiornamento.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
