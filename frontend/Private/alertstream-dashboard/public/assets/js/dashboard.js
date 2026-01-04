// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.userId = null;
        this.stats = null;
        this.charts = {};
        this.socket = null;
        
        this.init();
    }
    
    async init() {
        // Get user data from session
        this.userId = await this.getUserId();
        
        // Initialize real-time updates
        this.initSocket();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Initialize charts
        this.initCharts();
        
        // Set up auto-refresh
        this.setupAutoRefresh();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    async getUserId() {
        try {
            const response = await fetch('/api/v1/auth/me');
            if (response.ok) {
                const data = await response.json();
                return data.user.id;
            }
        } catch (error) {
            console.error('Failed to get user ID:', error);
        }
        return null;
    }
    
    initSocket() {
        // Connect to WebSocket for real-time updates
        if (typeof io !== 'undefined') {
            this.socket = io({
                path: '/socket.io',
                transports: ['websocket', 'polling']
            });
            
            this.socket.on('connect', () => {
                console.log('Connected to dashboard socket');
            });
            
            this.socket.on('new_alert', (alert) => {
                this.handleNewAlert(alert);
            });
            
            this.socket.on('stats_updated', (stats) => {
                this.updateStats(stats);
            });
        }
    }
    
    async loadDashboardData() {
        try {
            const [stats, activity, status] = await Promise.all([
                this.fetchDashboardStats(),
                this.fetchRecentActivity(),
                this.fetchSystemStatus()
            ]);
            
            this.stats = stats;
            this.updateDashboardUI(stats, activity, status);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }
    
    async fetchDashboardStats() {
        const response = await fetch('/api/v1/dashboard/overview');
        const data = await response.json();
        return data.data;
    }
    
    async fetchRecentActivity() {
        const response = await fetch('/api/v1/dashboard/recent-alerts?limit=10');
        const data = await response.json();
        return data.data?.alerts || [];
    }
    
    async fetchSystemStatus() {
        const response = await fetch('/api/v1/dashboard/system-status');
        const data = await response.json();
        return data.data;
    }
    
    updateDashboardUI(stats, activity, status) {
        this.updateStatsCards(stats);
        this.updateActivityList(activity);
        this.updateStatusList(status);
        this.updateCharts(stats);
        this.updateLastUpdated();
    }
    
    updateStatsCards(stats) {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid || !stats?.overview) return;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${(stats.overview.totalAlerts || 0).toLocaleString()}</div>
                <div class="stat-label">Total Alerts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(stats.overview.successfulAlerts || 0).toLocaleString()}</div>
                <div class="stat-label">Successful Alerts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.overview.activeMonitors || 0}</div>
                <div class="stat-label">Active Monitors</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$${(stats.overview.savings || 0).toLocaleString()}</div>
                <div class="stat-label">Estimated Savings</div>
            </div>
        `;
    }
    
    updateActivityList(activities) {
        const activityList = document.getElementById('activity-list');
        if (!activityList || !activities) return;
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-title">${(activity.message || '').substring(0, 60)}...</div>
                    <div class="activity-time">${activity.timeAgo || ''}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateStatusList(status) {
        const statusList = document.getElementById('status-list');
        if (!statusList || !status) return;
        
        const statusItems = ['api', 'sms', 'email', 'database'];
        statusList.innerHTML = statusItems.map(item => `
            <div class="status-item">
                <span>${item.toUpperCase()}</span>
                <span class="status-badge ${status[item] || 'unknown'}">${status[item] || 'unknown'}</span>
            </div>
        `).join('');
    }
    
    initCharts() {
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx && typeof Chart !== 'undefined') {
            this.charts.activity = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Alerts',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
    
    updateCharts(stats) {
        if (this.charts.activity) {
            const labels = this.generateDateLabels();
            const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50);
            
            this.charts.activity.data.labels = labels;
            this.charts.activity.data.datasets[0].data = data;
            this.charts.activity.update();
        }
    }
    
    generateDateLabels() {
        const labels = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }
    
    handleNewAlert(alert) {
        this.addNewActivityItem(alert);
        this.incrementAlertCount();
        this.showNotification(alert);
    }
    
    addNewActivityItem(alert) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-content">
                <div class="activity-title">${(alert.message || '').substring(0, 60)}...</div>
                <div class="activity-time">just now</div>
            </div>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }
    
    incrementAlertCount() {
        const alertsBadge = document.getElementById('alerts-badge');
        if (alertsBadge) {
            const currentCount = parseInt(alertsBadge.textContent) || 0;
            alertsBadge.textContent = currentCount + 1;
        }
    }
    
    showNotification(alert) {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            new Notification("New Alert", { body: alert.message });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("New Alert", { body: alert.message });
                }
            });
        }
    }
    
    setupAutoRefresh() {
        setInterval(() => this.refreshStats(), 60000);
        setInterval(() => this.refreshActivity(), 30000);
    }
    
    async refreshStats() {
        try {
            const stats = await this.fetchDashboardStats();
            this.updateStatsCards(stats);
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to refresh stats:', error);
        }
    }
    
    async refreshActivity() {
        try {
            const activity = await this.fetchRecentActivity();
            this.updateActivityList(activity);
        } catch (error) {
            console.error('Failed to refresh activity:', error);
        }
    }
    
    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = `Updated just now`;
        }
    }
    
    setupEventListeners() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.location.href = `/alerts?search=${encodeURIComponent(e.target.value)}`;
                }
            });
        }
    }
    
    showError(message) {
        console.error('Dashboard Error:', message);
    }
}

// Modal functions
function showQuickAdd() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) modal.style.display = 'none';
}

function selectMonitorType(type) {
    closeModal();
    window.location.href = `/monitors/new?type=${type}`;
}

function testIntegration() {
    fetch('/api/v1/integrations/test', { method: 'POST' })
        .then(res => res.json())
        .then(data => alert(data.success ? 'Test successful!' : 'Test failed: ' + data.error))
        .catch(err => alert('Test failed: ' + err.message));
}

function exportData() {
    const format = prompt('Export format (csv/json/pdf):', 'csv');
    if (format && ['csv', 'json', 'pdf'].includes(format.toLowerCase())) {
        window.location.href = `/api/v1/dashboard/export?format=${format}`;
    }
}

function viewDocs() {
    window.open('https://docs.alertstream.com', '_blank');
}

function contactSupport() {
    window.location.href = '/support';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
