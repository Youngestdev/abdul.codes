---
title: "Mini Server Watch Board"
description: "Out of curiousity and wanting to work on something, I played around with building a server watch dashboard."
date: 2025-02-14
---

At [Codecafé](https://thecodecafe.co), we've been building a product which will be unveiled soon. For this product, I
work as the lead _solo_ backend engineer where I happen to have spent the last few months doing some interesting
engineering work.

> Unfortunately, this blogpost isn't going to be detailed. It's basically a summary because I just wanted to write it.
> Hopefully someday when I have buttressed my knowledge, I can write more engineering focused articles.

The development for our product is distributed among the founders and I happen to have so much free time, so my churn
rate
has been really high. Some weeks ago, I became curious and decided to build a monitoring dashboard in an attempt to see
what's going on in the backend memory wise.

The original idea was a dashboard where I can see the **average** time for a
request. Locally, the requests are fast but what happens when we launch and have several users? We'll scale, I know.

I had help with Claude (my first time using Claude and I think it's way better than GPT?) for the dashboard because I
can't save my life writing anything frontend.

## Server watch

The dashboard monitors the application's metrics such as request counts (and to what endpoints) and the memory usage.
These classes are parent classes or should I call them the **main utility** classes. They're both used in another class
`EnhancedHealthCheck`, where the requests are tracked and the memory is properly analysed.

> The memory consumption monitored is basically due to database operations.

### What tool?

Well, the key tool used is [psutil](https://pypi.org/project/psutil/). It's a library used to monitor systems and
process management. I also made use of `motor` for MongoDB database connection and FastAPI for defining a route to
preview the dashboard.

> The first time I ran the code, I was really worried when I saw a 82% usage. Apparently, this was unrelated to the app
> and was a culmination of some processes altogether on my laptop. Huge relief.

That's that, I'll get to it.

### Application metrics

For the application metrics, I wanted to see what endpoints was visited the most. During development, I have a mental
memory of the routes I visit a lot. I just wanted to have fun and see this in realtime.

So, the class for mananging the metrics contained three methods:

1. The `add_error` which sustained a list of errors which had occured when using the application. 400s, 500s, etc.
2. The `get_average_response_time` which is the key method for me. This returned the average response time by diving the
			number of response times against the sum of the response times.... I think this is called _mean_. Oh, average.
3. The `get_error_rate` method which told me "Hey, be ashamed of yourself for all these errors!"

All of these put into consideration and we have the class:

```py
import psutil


class ApplicationMetrics:
	def __init__(self):
		self.start_time = time.time()
		self.request_count = 0
		self.error_count = 0
		self.response_times = []
		self.endpoints_usage = {}
		self.status_codes = {}
		self.last_errors = []
		self.max_stored_errors = 10

	def add_error(self, error: Dict[str, Any]):
		self.last_errors.insert(0, error)
		if len(self.last_errors) > self.max_stored_errors:
			self.last_errors.pop()

	def get_average_response_time(self) -> float:
		if not self.response_times:
			return 0
		return sum(self.response_times) / len(self.response_times)

	def get_error_rate(self) -> float:
		if self.request_count == 0:
			return 0
		return (self.error_count / self.request_count) * 100
```

### Memory analytics

I made use of `psutil` here. The methods:

1. `get_process_memory_details()` does as it's named. It returns a detailed memory usage for the current process. For
			example, process A is handled by an endpoint, it returns that.
2. `get_system_memory_details()` was the method that made me panic because it was reading all system-wide info
			initially.

```py
class MemoryAnalytics:
	@staticmethod
	def get_process_memory_details() -> Dict:
		process = psutil.Process()

		memory_info = process.memory_info()

		threads_memory = []
		for thread in process.threads():
			try:
				thread_proc = psutil.Process(thread.id)
				threads_memory.append({
					'thread_id': thread.id,
					'memory_info': thread_proc.memory_info()._asdict()
				})
			except (psutil.NoSuchProcess, psutil.AccessDenied):
				continue

		return {
			'process': {
				'pid': process.pid,
				'memory_percent': process.memory_percent(),
				'memory_info': memory_info._asdict(),
				'num_threads': process.num_threads(),
				'open_files': len(process.open_files()),
				'connections': len(process.connections())
			},
			'threads': sorted(
				threads_memory,
				key=lambda x: x['memory_info']['rss'],
				reverse=True
			)[:5]  # Top 5 memory consuming threads
		}

	@staticmethod
	def get_system_memory_details() -> Dict:
		vm = psutil.virtual_memory()
		swap = psutil.swap_memory()

		return {
			'virtual_memory': {
				'total': vm.total,
				'available': vm.available,
				'used': vm.used,
				'free': vm.free,
				'percent': vm.percent,
				'active': getattr(vm, 'active', None),
				'inactive': getattr(vm, 'inactive', None),
				'buffers': getattr(vm, 'buffers', None),
				'cached': getattr(vm, 'cached', None),
				'shared': getattr(vm, 'shared', None)
			},
			'swap_memory': {
				'total': swap.total,
				'used': swap.used,
				'free': swap.free,
				'percent': swap.percent,
				'sin': swap.sin,
				'sout': swap.sout
			}
		}

```

## Now, what?

Well. These are skeletal classes that needs to be plugged somewhere or made use of. The `EnhancedHealthCheck` contains
methods that dealt with time formatting, listening to requests to track them down, take a memory source to monitor (the
`__init__` method), etc.

```py
class EnhancedHealthCheck:
	def __init__(self, app: FastAPI, db_client: AsyncIOMotorClient):
		self.app = app
		self.db_client = db_client
		self.start_time = time.time()
		self.metrics = ApplicationMetrics()
		self.memory_analytics = MemoryAnalytics()

	def format_uptime(self, seconds: float) -> str:
		days = int(seconds // (24 * 3600))
		seconds = seconds % (24 * 3600)
		hours = int(seconds // 3600)
		seconds %= 3600
		minutes = int(seconds // 60)
		seconds = int(seconds % 60)

		parts = []
		if days > 0:
			parts.append(f"{days}d")
		if hours > 0:
			parts.append(f"{hours}h")
		if minutes > 0:
			parts.append(f"{minutes}m")
		parts.append(f"{seconds}s")

		return " ".join(parts)

	async def track_request_metrics(self, request: Request, call_next):
		start_time = time.time()
		try:
			response = await call_next(request)

			# Update metrics
			self.metrics.request_count += 1
			response_time = time.time() - start_time
			self.metrics.response_times.append(response_time)

			# Track endpoint usage
			endpoint = f"{request.method} {request.url.path}"
			self.metrics.endpoints_usage[endpoint] = (
				self.metrics.endpoints_usage.get(endpoint, 0) + 1
			)

			# Track status codes
			self.metrics.status_codes[response.status_code] = (
				self.metrics.status_codes.get(response.status_code, 0) + 1
			)

			return response
		except Exception as e:
			self.metrics.error_count += 1
			self.metrics.add_error({
				"timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
				"error": str(e),
				"endpoint": f"{request.method} {request.url.path}"
			})
			raise

	async def get_detailed_health(self, request: Request) -> Dict[str, Any]:
		uptime_seconds = time.time() - self.start_time

		# Check database connection
		try:
			await self.db_client.server_info()
			db_status = "healthy"
		except Exception as e:
			db_status = f"error: {str(e)}"

		memory_analysis = {
			'process': self.memory_analytics.get_process_memory_details(),
			'system': self.memory_analytics.get_system_memory_details()
		}

		return {
			"status": "healthy" if db_status == "healthy" else "unhealthy",
			"uptime": {
				"seconds": uptime_seconds,
				"formatted": self.format_uptime(uptime_seconds)
			},
			"database": {
				"status": db_status
			},
			"memory_analysis": memory_analysis,
			"application": {
				"total_requests": self.metrics.request_count,
				"error_count": self.metrics.error_count,
				"error_rate": self.metrics.get_error_rate(),
				"average_response_time": round(self.metrics.get_average_response_time(), 3),
				"status_codes": self.metrics.status_codes,
				"endpoints": self.metrics.endpoints_usage,
				"recent_errors": self.metrics.last_errors
			}
		}

```

The last method is the `get_dashboard_html()` method from Claude. I can't explain it but it's a beautiful one. AI is a
good companion o. Can they work on one that'll generate mockups or smtn in Figma? I need that urgently!

The `get_dashboard_html()` is defined as:

```py
def get_dashboard_html(self) -> str:
	return """
<!DOCTYPE html>
<html>
   <head>
      <title>Enhanced Server Status Dashboard</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
         body {
         font-family: Arial, sans-serif;
         margin: 20px;
         background-color: #f5f5f5;
         padding-bottom: 40px;
         }
         .grid {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
         gap: 20px;
         }
         .card {
         border: 1px solid #ddd;
         border-radius: 8px;
         padding: 15px;
         background: white;
         box-shadow: 0 2px 4px rgba(0,0,0,0.1);
         }
         .metric-value {
         font-size: 24px;
         font-weight: bold;
         color: #2c3e50;
         }
         .metric-label {
         color: #7f8c8d;
         font-size: 14px;
         }
         .healthy { color: #27ae60; }
         .warning { color: #f39c12; }
         .error { color: #c0392b; }
         .refresh-btn {
         position: fixed;
         top: 20px;
         right: 20px;
         padding: 10px 20px;
         background-color: #4CAF50;
         color: white;
         border: none;
         border-radius: 4px;
         cursor: pointer;
         z-index: 1000;
         transition: background-color 0.3s ease;
         }
         .refresh-btn:hover {
         background-color: #45a049;
         }
         .refresh-btn:active {
         transform: scale(0.98);
         }
         .last-updated {
         position: fixed;
         top: 60px;
         right: 20px;
         color: #666;
         font-size: 12px;
         z-index: 1000;
         }
         .header {
         margin-bottom: 20px;
         padding-right: 200px;
         }
         .memory-bar {
         width: 100%;
         height: 24px;
         background: #f0f0f0;
         border-radius: 4px;
         overflow: hidden;
         margin: 10px 0;
         display: flex;
         }
         .bar-segment {
         height: 100%;
         display: inline-block;
         text-align: center;
         color: white;
         font-size: 12px;
         line-height: 24px;
         }
         .bar-segment.used {
         background-color: #ff6b6b;
         }
         .bar-segment.cached {
         background-color: #4ecdc4;
         }
         .bar-segment.free {
         background-color: #95a5a6;
         }
         .memory-details, .memory-stats {
         font-size: 14px;
         margin: 10px 0;
         }
         .thread-list {
         max-height: 200px;
         overflow-y: auto;
         }
         .thread-item {
         padding: 5px;
         border-bottom: 1px solid #eee;
         }
         .error-item {
         margin-bottom: 10px;
         padding: 8px;
         border-left: 4px solid #c0392b;
         background-color: #fef2f2;
         }
         .error-item strong {
         color: #c0392b;
         }
      </style>
   </head>
   <body>
      <div class="header">
         <h1>Enhanced Server Status Dashboard</h1>
      </div>
      <button class="refresh-btn" id="refresh-dashboard">
      Refresh Dashboard
      </button>
      <div class="last-updated" id="last-updated"></div>
      <div class="grid">
         <div class="card">
            <h2>System Overview</h2>
            <div id="system-overview"></div>
         </div>
         <div class="card">
            <h2>Resource Usage</h2>
            <canvas id="resourceChart"></canvas>
         </div>
         <div class="card">
            <h2>Memory Analysis</h2>
            <div id="memory-analysis"></div>
         </div>
         <div class="card">
            <h2>Application Metrics</h2>
            <div id="app-metrics"></div>
         </div>
         <div class="card">
            <h2>Recent Errors</h2>
            <div id="recent-errors"></div>
         </div>
         <div class="card">
            <h2>Endpoint Usage</h2>
            <canvas id="endpointChart"></canvas>
         </div>
      </div>
      <script>
         let dashboardActive = true;
         let updateInterval;
         let isUpdating = false;  // Flag to prevent multiple simultaneous updates

         function formatBytes(bytes, decimals = 2) {
         if (bytes === 0) return '0 Bytes';
         const k = 1024;
         const dm = decimals < 0 ? 0 : decimals;
         const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
         const i = Math.floor(Math.log(bytes) / Math.log(k));
         return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
         }

         async function updateDashboard() {
         if (isUpdating) return;  // Prevent multiple simultaneous updates
         isUpdating = true;

         try {
         const response = await fetch('/api/v1/health');
         const data = await response.json();

         // Update system overview
         document.getElementById('system-overview').innerHTML = `
         <div class="metric">
         <div class="metric-value ${data.status}">${data.status}</div>
         <div class="metric-label">Status</div>
         </div>
         <div class="metric">
         <div class="metric-value">${data.uptime.formatted}</div>
         <div class="metric-label">Uptime</div>
         </div>
         `;

         // Update application metrics
         document.getElementById('app-metrics').innerHTML = `
         <div class="metric">
         <div class="metric-value">${data.application.total_requests}</div>
         <div class="metric-label">Total Requests</div>
         </div>
         <div class="metric">
         <div class="metric-value">${data.application.error_rate.toFixed(2)}%</div>
         <div class="metric-label">Error Rate</div>
         </div>
         <div class="metric">
         <div class="metric-value">${data.application.average_response_time}s</div>
         <div class="metric-label">Avg Response Time</div>
         </div>
         `;

         // Update memory analysis
         const memoryAnalysis = document.getElementById('memory-analysis');
         const memData = data.memory_analysis;

         memoryAnalysis.innerHTML = `
         <h3>Process Memory</h3>
         <div class="memory-metric">
         <div class="metric-value">${memData.process.process.memory_percent.toFixed(2)}%</div>
         <div class="metric-label">Process Memory Usage</div>
         </div>
         <div class="memory-details">
         <p>RSS: ${formatBytes(memData.process.process.memory_info.rss)}</p>
         <p>VMS: ${formatBytes(memData.process.process.memory_info.vms)}</p>
         <p>Threads: ${memData.process.process.num_threads}</p>
         <p>Open Files: ${memData.process.process.open_files}</p>
         </div>

         <h3>System Memory</h3>
         <div class="memory-system">
         <div class="memory-bar">
         <div class="bar-segment used"
         style="width: ${memData.system.virtual_memory.percent}%">
         Used (${memData.system.virtual_memory.percent}%)
         </div>
         <div class="bar-segment cached"
         style="width: ${(memData.system.virtual_memory.cached || 0) / memData.system.virtual_memory.total * 100}%">
         Cached
         </div>
         <div class="bar-segment free"
         style="width: ${100 - memData.system.virtual_memory.percent}%">
         Free
         </div>
         </div>
         <div class="memory-stats">
         <p>Total: ${formatBytes(memData.system.virtual_memory.total)}</p>
         <p>Available: ${formatBytes(memData.system.virtual_memory.available)}</p>
         <p>Used: ${formatBytes(memData.system.virtual_memory.used)}</p>
         <p>Cached: ${formatBytes(memData.system.virtual_memory.cached || 0)}</p>
         </div>
         </div>

         <h3>Top Memory Threads</h3>
         <div class="thread-list">
         ${memData.process.threads.map(thread => `
         <div class="thread-item">
         Thread ${thread.thread_id}: ${formatBytes(thread.memory_info.rss)}
         </div>
         `).join('')}
         </div>
         `;

         // Update recent errors
         document.getElementById('recent-errors').innerHTML =
         data.application.recent_errors
         .map(error => `
         <div class="error-item">
         <strong>${error.timestamp}</strong>
         <p>${error.error}</p>
         <small>${error.endpoint}</small>
         </div>
         `)
         .join('');

         // Update charts
         updateResourceChart(data);
         updateEndpointChart(data);

         // Update last updated timestamp
         updateLastUpdated();

         } catch (error) {
         console.error('Failed to update dashboard:', error);
         } finally {
         isUpdating = false;  // Reset the update flag
         }
         }

         function updateResourceChart(data) {
         const ctx = document.getElementById('resourceChart').getContext('2d');
         const processData = data.memory_analysis.process.process;

         new Chart(ctx, {
         type: 'bar',
         data: {
         labels: ['Memory Usage', 'Threads', 'Open Files', 'Connections'],
         datasets: [{
         label: 'Mercury Process Metrics',
         data: [
         processData.memory_percent,
         processData.num_threads,
         processData.open_files,
         processData.connections
         ],
         backgroundColor: [
         'rgba(54, 162, 235, 0.2)',  // Memory
         'rgba(255, 99, 132, 0.2)',   // Threads
         'rgba(75, 192, 192, 0.2)',   // Files
         'rgba(255, 206, 86, 0.2)'    // Connections
         ],
         borderColor: [
         'rgba(54, 162, 235, 1)',
         'rgba(255, 99, 132, 1)',
         'rgba(75, 192, 192, 1)',
         'rgba(255, 206, 86, 1)'
         ],
         borderWidth: 1
         }]
         },
         options: {
         responsive: true,
         scales: {
         y: {
         beginAtZero: true,
         title: {
         display: true,
         text: 'Count/Percentage'
         }
         }
         },
         plugins: {
         title: {
         display: true,
         text: 'Mercury Process Resources'
         },
         tooltip: {
         callbacks: {
         label: function(context) {
         const label = context.dataset.label || '';
         const value = context.parsed.y;
         if (context.dataIndex === 0) {
         return `Memory: ${value.toFixed(2)}%`;
         }
         return `${context.label}: ${value}`;
         }
         }
         }
         }
         }
         });
         }

         function updateEndpointChart(data) {
         const ctx = document.getElementById('endpointChart').getContext('2d');
         const endpoints = Object.keys(data.application.endpoints);
         const counts = Object.values(data.application.endpoints);

         new Chart(ctx, {
         type: 'pie',
         data: {
         labels: endpoints,
         datasets: [{
         data: counts,
         backgroundColor: endpoints.map(() =>
         `hsl(${Math.random() * 360}, 70%, 50%)`
         )
         }]
         }
         });
         }

         function updateLastUpdated() {
         const now = new Date().toLocaleString();
         document.getElementById('last-updated').textContent = `Last updated: ${now}`;
         }

         function startDashboardUpdates() {
         dashboardActive = true;
         updateDashboard();
         updateInterval = setInterval(updateDashboard, 30000); // 30 seconds
         }

         function stopDashboardUpdates() {
         dashboardActive = false;
         if (updateInterval) {
         clearInterval(updateInterval);
         }
         }

         // Handle page visibility
         document.addEventListener('visibilitychange', function() {
         if (document.hidden) {
         stopDashboardUpdates();
         } else {
         startDashboardUpdates();
         }
         });

         // Handle refresh button click
         document.addEventListener('DOMContentLoaded', function() {
         document.getElementById('refresh-dashboard').addEventListener('click', function() {
         updateDashboard();
         });
         });

         // Initial load
         startDashboardUpdates();
      </script>
   </body>
</html>
 """
```

## Wrap it up!

Since I needed this to work in my FastAPI application, I had it all wrapped up in a function so I can just make use of
it in my main app:

```py

def setup_enhanced_health_routes(app: FastAPI, db_client: AsyncIOMotorClient) -> None:
	health_checker = EnhancedHealthCheck(app, db_client)

	@app.middleware("http")
	async def metrics_middleware(request: Request, call_next):
		return await health_checker.track_request_metrics(request, call_next)

	@app.get("/health")
	async def health(request: Request):
		return await health_checker.get_detailed_health(request)

	@app.get("/dashboard", response_class=HTMLResponse)
	async def dashboard():
		return health_checker.get_dashboard_html()
```

Here's how the dashboard looks:

![Dashboard](https://i.ibb.co/DHcVKwvP/Screenshot-2025-02-14-at-23-27-02.png)

A database client is attached so I can monitor the I/O operations and know when to panic and when not to.

## Thanks

Thanks to Claude, truly. I can't do it all and that's why we have them(LLMs).

---
