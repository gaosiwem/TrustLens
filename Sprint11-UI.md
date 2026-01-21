Sprint11-UI.md

<!DOCTYPE html>
<html class="dark" lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>AI Insights Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
    <script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#13b6ec",
              backgroundLight: "#f6f8f8",
              backgroundDark: "#101d22",
            },
            fontFamily: {
              display: ["Manrope", "sans-serif"]
            },
          },
        },
      }
    </script>
    <style>
      body {
        min-height: 100dvh;
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
  </head>
  <body class="bg-backgroundLight dark:bg-backgroundDark font-display text-[#111618] dark:text-white min-h-screen flex flex-col">
    
    <!-- Top Navigation -->
    <header class="w-full bg-white dark:bg-[#1a2c34] shadow-md px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold text-[#111618] dark:text-white">TrustLens AI Insights</h1>
      <div class="flex items-center gap-2">
        <button id="theme-toggle" class="p-2 rounded-full bg-[#e6e8e9] dark:bg-[#2c3e46] hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-primary">light_mode</span>
        </button>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Side Drawer / Menu -->
      <aside class="hidden md:flex flex-col w-64 bg-white dark:bg-[#1a2c34] border-r border-[#dce0e5] dark:border-[#2c3e46] p-4">
        <nav class="flex flex-col gap-2">
          <a href="#" class="px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Dashboard</a>
          <a href="#" class="px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Complaints</a>
          <a href="#" class="px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Insights</a>
          <a href="#" class="px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">Settings</a>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-[#1a2c34] rounded-xl shadow p-4 flex flex-col gap-2">
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Total Complaints</span>
            <span class="text-2xl font-bold">1,245</span>
          </div>
          <div class="bg-white dark:bg-[#1a2c34] rounded-xl shadow p-4 flex flex-col gap-2">
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Resolved</span>
            <span class="text-2xl font-bold">98%</span>
          </div>
          <div class="bg-white dark:bg-[#1a2c34] rounded-xl shadow p-4 flex flex-col gap-2">
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Pending</span>
            <span class="text-2xl font-bold">17%</span>
          </div>
          <div class="bg-white dark:bg-[#1a2c34] rounded-xl shadow p-4 flex flex-col gap-2">
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">AI Suggested Fixes</span>
            <span class="text-2xl font-bold">532</span>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Complaint Categories Bar Chart Placeholder -->
          <div class="bg-white dark:bg-[#1a2c34] p-4 rounded-xl shadow">
            <h2 class="font-bold text-sm mb-2">Complaint Categories</h2>
            <div class="h-64 bg-[#e6e8e9] dark:bg-[#24363e] flex items-center justify-center rounded">Bar Chart Placeholder</div>
          </div>

          <!-- Trend Line Chart Placeholder -->
          <div class="bg-white dark:bg-[#1a2c34] p-4 rounded-xl shadow">
            <h2 class="font-bold text-sm mb-2">Complaints Trend</h2>
            <div class="h-64 bg-[#e6e8e9] dark:bg-[#24363e] flex items-center justify-center rounded">Line Chart Placeholder</div>
          </div>
        </div>

        <!-- Complaint List with Infinite Scroll Placeholder -->
        <section class="bg-white dark:bg-[#1a2c34] p-4 rounded-xl shadow">
          <h2 class="font-bold text-sm mb-4">Recent Complaints</h2>
          <div class="flex flex-col gap-3 max-h-96 overflow-y-auto no-scrollbar">
            <!-- Mock Complaint Items -->
            <div class="flex justify-between p-3 rounded-lg border border-[#dce0e5] dark:border-[#2c3e46] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
              <div class="flex flex-col">
                <span class="font-semibold">Brand: Acme Corp</span>
                <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Complaint: Late delivery</span>
              </div>
              <span class="text-xs font-medium text-[#13b6ec] dark:text-primary">Resolved</span>
            </div>
            <div class="flex justify-between p-3 rounded-lg border border-[#dce0e5] dark:border-[#2c3e46] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
              <div class="flex flex-col">
                <span class="font-semibold">Brand: Tech Solutions</span>
                <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Complaint: Wrong item shipped</span>
              </div>
              <span class="text-xs font-medium text-yellow-400">Pending</span>
            </div>
            <div class="flex justify-between p-3 rounded-lg border border-[#dce0e5] dark:border-[#2c3e46] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
              <div class="flex flex-col">
                <span class="font-semibold">Brand: Retail Mart</span>
                <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Complaint: Refund not received</span>
              </div>
              <span class="text-xs font-medium text-red-500">Escalated</span>
            </div>
          </div>
        </section>

        <!-- Complaint Detail Modal / Panel -->
        <div class="bg-white dark:bg-[#1a2c34] p-4 rounded-xl shadow mt-6">
          <h2 class="font-bold text-sm mb-4">Complaint Details</h2>
          <div class="flex flex-col gap-2">
            <span class="font-semibold">Brand: Acme Corp</span>
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Order #: 12345</span>
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">Status: Pending</span>
            <span class="text-xs text-[#637588] dark:text-[#93a2b7]">AI Suggestion: Refund customer</span>
          </div>

          <!-- File Preview -->
          <div class="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            <div class="w-24 h-24 bg-[#e6e8e9] dark:bg-[#24363e] flex items-center justify-center rounded">Img1</div>
            <div class="w-24 h-24 bg-[#e6e8e9] dark:bg-[#24363e] flex items-center justify-center rounded">PDF1</div>
          </div>

          <!-- Follow-up / Comment Form -->
          <form class="mt-4 flex flex-col gap-3">
            <label class="text-sm font-medium" for="comment">Add Comment / Follow-up</label>
            <textarea id="comment" class="w-full h-20 p-2 rounded-xl border border-[#dce0e5] dark:border-[#2c3e46] bg-white dark:bg-[#1a2c34] text-[#111618] dark:text-white placeholder:text-[#93a2b7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Type here..."></textarea>
            <button class="w-full h-12 bg-primary hover:bg-opacity-90 text-white font-bold rounded-xl mt-2">Submit</button>
          </form>
        </div>

      </main>
    </div>

    <!-- Dark/Light Mode Script -->
    <script>
      const toggle = document.getElementById("theme-toggle");
      const html = document.documentElement;
      toggle.addEventListener("click", () => {
        html.classList.toggle("dark");
      });
    </script>

  </body>
</html>

✅ What is Implemented in Sprint11-UI.md

Top Navigation & Dark/Light toggle

Side drawer + top nav (responsive mobile/desktop)

Summary cards for metrics (Total complaints, Resolved %, Pending, AI suggested fixes)

Charts placeholders for bar/line charts

Complaint list with mock data, infinite scroll placeholder

Complaint detail panel with AI suggestion, status, and file preview

Follow-up form using consistent styling

Dark/Light mode toggle with TailwindCSS
