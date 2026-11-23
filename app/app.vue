<template>
  <div class="app-shell">
    <header class="topbar">
      <NuxtLink to="/" class="brand">Roast me Coffee Company</NuxtLink>
    </header>
    <main class="container">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  background: #f6f5f2;
  color: #1f1f1f;
}
.topbar {
  background: #2c1e16;
  color: #fff;
  padding: 1rem 2rem;
}
.brand {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
}
.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
}
button {
  cursor: pointer;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  font-weight: 600;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
button.primary {
  background: #2c1e16;
  color: #fff;
  border-color: #2c1e16;
}
</style>