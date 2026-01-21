<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>User Authentication</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#13b6ec",
              "background-light": "#f6f8f8",
              "background-dark": "#101d22",
            },
            fontFamily: {
              "display": ["Manrope", "sans-serif"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        /* Custom styles to hide scrollbar for cleaner mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#111618] dark:text-white min-h-screen flex flex-col items-center justify-center">
<div class="relative flex h-full w-full max-w-md flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden overflow-y-auto no-scrollbar">
<!-- Header Section with Abstract AI Background -->
<div class="relative w-full flex flex-col items-center pt-8 pb-4">
<!-- Decorative gradient blur -->
<div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none opacity-50 blur-3xl"></div>
<div class="z-10 flex flex-col items-center gap-4 px-6 text-center">
<div class="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 text-primary mb-2">
<span class="material-symbols-outlined text-4xl">auto_fix_high</span>
</div>
<h1 class="text-[#111618] dark:text-white tracking-tight text-[32px] font-bold leading-tight">Resolve complaints faster.</h1>
<p class="text-[#637588] dark:text-[#93a2b7] text-base font-medium leading-normal">Your AI advocate is ready to help you fix issues with any brand.</p>
</div>
</div>
<!-- Segmented Toggle -->
<div class="px-6 py-4 z-10">
<div class="flex h-12 w-full items-center justify-center rounded-xl bg-[#e6e8e9] dark:bg-[#1a2c34] p-1">
<label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#2c3e46] has-[:checked]:shadow-sm has-[:checked]:text-[#111618] dark:has-[:checked]:text-white text-[#637588] dark:text-[#93a2b7] text-sm font-semibold leading-normal transition-all duration-200">
<span class="truncate">Log In</span>
<input checked="" class="invisible w-0" name="auth_type" type="radio" value="Log In"/>
</label>
<label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#2c3e46] has-[:checked]:shadow-sm has-[:checked]:text-[#111618] dark:has-[:checked]:text-white text-[#637588] dark:text-[#93a2b7] text-sm font-semibold leading-normal transition-all duration-200">
<span class="truncate">Sign Up</span>
<input class="invisible w-0" name="auth_type" type="radio" value="Sign Up"/>
</label>
</div>
</div>
<!-- Form Section -->
<div class="flex flex-col gap-4 px-6 z-10 w-full">
<!-- Email Input -->
<div class="flex flex-col gap-1.5">
<label class="text-[#111618] dark:text-white text-sm font-medium leading-normal" for="email">Email Address</label>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-3 text-[#637588] dark:text-[#93a2b7]">mail</span>
<input class="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-[#1a2c34] border border-[#dce0e5] dark:border-[#2c3e46] text-[#111618] dark:text-white placeholder:text-[#93a2b7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" id="email" placeholder="you@example.com" type="email"/>
</div>
</div>
<!-- Password Input -->
<div class="flex flex-col gap-1.5">
<div class="flex justify-between items-center">
<label class="text-[#111618] dark:text-white text-sm font-medium leading-normal" for="password">Password</label>
<a class="text-primary text-xs font-semibold hover:underline" href="#">Forgot?</a>
</div>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-3 text-[#637588] dark:text-[#93a2b7]">lock</span>
<input class="w-full h-12 pl-10 pr-10 rounded-xl bg-white dark:bg-[#1a2c34] border border-[#dce0e5] dark:border-[#2c3e46] text-[#111618] dark:text-white placeholder:text-[#93a2b7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" id="password" placeholder="••••••••" type="password"/>
<button class="absolute right-3 flex items-center justify-center text-[#637588] dark:text-[#93a2b7] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility_off</span>
</button>
</div>
</div>
<!-- Main Action Button -->
<button class="w-full h-12 bg-primary hover:bg-opacity-90 active:scale-[0.98] text-white font-bold text-base rounded-xl mt-2 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
<span>Welcome Back</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<!-- Biometric Option (Subtle) -->
<div class="flex justify-center pt-1 pb-2">
<button aria-label="Use FaceID" class="p-2 rounded-full hover:bg-white/5 text-primary/80 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-3xl">face</span>
</button>
</div>
</div>
<!-- Divider -->
<div class="flex items-center gap-4 px-6 py-2 w-full z-10">
<div class="h-px bg-[#dce0e5] dark:bg-[#2c3e46] flex-1"></div>
<p class="text-[#637588] dark:text-[#93a2b7] text-xs font-medium whitespace-nowrap">Or continue with</p>
<div class="h-px bg-[#dce0e5] dark:bg-[#2c3e46] flex-1"></div>
</div>
<!-- Social Login -->
<div class="grid grid-cols-2 gap-3 px-6 pb-6 w-full z-10">
<button class="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dce0e5] dark:border-[#2c3e46] bg-white dark:bg-[#1a2c34] hover:bg-[#f6f8f8] dark:hover:bg-[#24363e] transition-colors">
<svg class="h-5 w-5" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
</svg>
<span class="text-[#111618] dark:text-white text-sm font-semibold">Google</span>
</button>
<button class="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dce0e5] dark:border-[#2c3e46] bg-white dark:bg-[#1a2c34] hover:bg-[#f6f8f8] dark:hover:bg-[#24363e] transition-colors">
<svg class="h-5 w-5 dark:fill-white fill-[#111618]" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M16.365 1.57c0-1.05.86-1.57.94-1.57-.04.02-1.96.65-2.73 2.53-.59 1.45.1 2.91.17 3.01.07-.02 2.12-.55 2.76-2.52.4-1.22-.05-2.22-.11-2.31l-.06-.11.02-.03zM18.89 20.35c.14.39-.23 1.34-1.09 2.59-.72 1.05-1.48 2.06-2.66 2.06h-.04c-1.12-.04-1.48-.66-2.76-.66-1.32 0-1.74.64-2.74.66h-.05c-1.11 0-1.95-1.07-2.68-2.12-1.45-2.1-2.55-5.32-1.06-7.91 1.06-1.84 2.94-2.99 4.74-2.99 1.25 0 2.22.82 2.91.82.7 0 1.95-.91 3.28-.79.56.02 2.13.23 3.13 1.7-.08.05-1.87 1.09-1.86 3.26.01 2.61 2.28 3.51 2.37 3.55l-.01.03-.4.76zM15.11 10.66c-1.81 0-3.1 1.03-3.76 1.43-.87.52-2.16.27-2.62-.05-.44-.31-.76-1.57.19-2.92.83-1.19 2.51-2.32 4.19-2.32 1.75 0 3.32.96 4.09 2.28.61 1.04.5 2.35.09 2.85-.32.39-1.22.65-1.96.11-.1-.08-.12-.09-.22-.16-.39-.27-1.18-.82-1.74-1.01-.27-.09-.43-.11-.26-.21z"></path>
</svg>
<span class="text-[#111618] dark:text-white text-sm font-semibold">Apple</span>
</button>
</div>
<!-- Footer -->
<div class="mt-auto px-6 pb-6 text-center z-10">
<p class="text-[#637588] dark:text-[#93a2b7] text-xs leading-normal">
                By continuing, you agree to our <a class="text-primary hover:underline" href="#">Terms of Service</a> &amp; <a class="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
</div>
<div class="h-5"></div>
</div>
</body></html>
