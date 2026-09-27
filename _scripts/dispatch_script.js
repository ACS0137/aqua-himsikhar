  // API URL from ENV config or hardcode for now
  const API_URL = 'https://example-api-url.execute-api.us-east-1.amazonaws.com/orders';
  let orders = [];

  function checkAuth() {
    const key = sessionStorage.getItem('dispatch_api_key');
    if (key) {
      document.getElementById('login-view').style.display = 'none';
      document.getElementById('dashboard-view').style.display = 'block';
      loadOrders();
    } else {
      document.getElementById('login-view').style.display = 'block';
      document.getElementById('dashboard-view').style.display = 'none';
    }
  }

  function login() {
    const key = document.getElementById('apiKey').value.trim();
    sessionStorage.setItem('dispatch_api_key', key);
    checkAuth();
  }

  function logout() {
    sessionStorage.removeItem('dispatch_api_key');
    checkAuth();
  }

  async function loadOrders() {
    const key = sessionStorage.getItem('dispatch_api_key') || '';
    
    // DEMO MODE
    if (key.toLowerCase() === 'demo') {
      orders = [
        { id: 'AH-260810-001', timestamp: new Date().toISOString(), status: 'pending', customerName: 'Rajesh Maharjan', customerPhone: '9841000000', area: 'Baluwatar', quantity: 3, productName: '19-Liter Jar', dueTotal: 1041, depositTotal: 900, emptiesCount: 0 },
        { id: 'AH-260810-002', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'out_for_delivery', customerName: 'Sita Sharma', customerPhone: '9851000001', area: 'Lazimpat', quantity: 5, productName: '19-Liter Jar', dueTotal: 235, depositTotal: 0, emptiesCount: 5 },
        { id: 'AH-260810-003', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'confirmed', customerName: 'Sunil Thapa', customerPhone: '9801000002', area: 'Patan', quantity: 2, productName: '1-Liter Bottle Pack', dueTotal: 504, depositTotal: 0, emptiesCount: 0 }
      ];
      renderTable();
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': 'Bearer ' + key }
      });
      if (res.status === 401) {
        document.getElementById('login-error').style.display = 'block';
        logout();
        return;
      }
      const data = await res.json();
      orders = data.orders || [];
      renderTable();
    } catch (err) {
      alert('Error fetching orders (Backend not connected). Try logging in with the key "demo".');
      console.error(err);
      logout();
    }
  }

  async function updateStatus(orderId, selectEl) {
    const key = sessionStorage.getItem('dispatch_api_key');
    const newStatus = selectEl.value;
    
    // Optimistic UI update
    const idx = orders.findIndex(o => o.id === orderId);
    if(idx > -1) orders[idx].status = newStatus;
    renderTable();

    if (key && key.toLowerCase() === 'demo') return; // Skip API call in demo mode

    try {
      await fetch(API_URL, {
        method: 'PATCH',
        headers: { 
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
    } catch(err) {
      alert('Failed to update status');
      loadOrders(); // reload truth
    }
  }

  function renderTable() {
    const tbody = document.getElementById('orders-tbody');
    const filter = document.getElementById('filterStatus').value;
    
    tbody.innerHTML = '';

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    filtered.forEach(o => {
      const date = new Date(o.timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${o.id}</strong></td>
        <td>${timeStr}</td>
        <td><span class="status-badge status-${o.status}">${o.status.toUpperCase().replace('_', ' ')}</span></td>
        <td>
          <strong>${o.customerName}</strong><br>
          <a href="tel:${o.customerPhone}" style="color:var(--navy); font-size:0.85rem;">${o.customerPhone}</a>
        </td>
        <td>${o.area}</td>
        <td>${o.quantity} × ${o.productName}</td>
        <td>
          <strong>Rs. ${o.dueTotal}</strong>
          ${o.depositTotal > 0 ? `<br><span style="font-size:0.8rem; color:#64748b;">Inc. ${o.depositTotal} dep.</span>` : ''}
        </td>
        <td><strong>${o.emptiesCount}</strong></td>
        <td>
          <select class="action-select" onchange="updateStatus('${o.id}', this)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  checkAuth();
