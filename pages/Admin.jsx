const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });


  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  //  Səhifə açılanda sessiyanı yoxla 
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchMessages();
        }
      } catch (err) {
        console.log("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  //  Mesajları çəkən funksiya 
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/messages`, { credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  //  backend Login 
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include' 
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        fetchMessages();
      } else {
        alert(data.message || "Entry denied!");
      }
    } catch (error) {
      alert("Server connection failed!");
    }
  };

  // Logout 
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/admin/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      setIsAuthenticated(false);
      setMessages([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const res = await fetch(`${API_BASE}/messages/${id}`, { 
          method: 'DELETE', 
          credentials: 'include' 
        });
        if (res.ok) fetchMessages();
      } catch (err) {
        alert("Error occurred while deleting the message!");
      }
    }
  };

  if (loading) return <div style={{background:'#09090b', color:'white', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'white' }}>
        <header style={{ padding: '30px 50px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>A G S H I N</div>
        </header>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleLogin} style={{ background: '#18181b', padding: '40px', borderRadius: '16px', border: '1px solid #27272a', width: '350px' }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Access</h2>
            <input 
              type="text" 
              placeholder="Username" 
              value={loginData.username} 
              onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
              style={{ background: '#09090b', border: '1px solid #27272a', color: 'white', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '20px', outline: 'none' }} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={loginData.password} 
              onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
              style={{ background: '#09090b', border: '1px solid #27272a', color: 'white', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '30px', outline: 'none' }} 
              required 
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#fff', padding: '0 0 60px 0' }}>
      <header style={{ padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #18181b' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>A G S H I N</div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
      </header>
      <div className="container" style={{ marginTop: '40px', padding: '0 50px' }}>
        <h2 style={{ marginBottom: '30px' }}>Dashboard</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {messages.length > 0 ? messages.map((m) => (
            <div key={m._id} style={{ background: '#18181b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{m.name}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{m.email}</p>
                <p style={{ color: '#e4e4e7', marginTop: '15px', whiteSpace: 'pre-wrap' }}>{m.text}</p>
                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '10px' }}>{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteMsg(m._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          )) : <p>No messages yet..</p>}
        </div>
      </div>
    </div>
  );
};