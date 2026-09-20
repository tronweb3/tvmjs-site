<script setup>
/**
 * A nav link that escapes VitePress's `base`.
 *
 * VitePress prefixes any nav `link` starting with `/` with the site base, so
 * `/tvmjs/` would resolve to `/tvmjs/docs/tvmjs/`. This renders the href verbatim.
 *
 * Deliberately no click handler: the href alone navigates, and adding one would break
 * cmd/ctrl-click and middle-click into a new tab.
 */
defineProps({
  title: { type: String, required: true },
  href: { type: String, required: true },
});
</script>

<template>
  <a class="external-nav-link" :href="href">
    <span>{{ title }}</span>
  </a>
</template>

<style scoped>
/**
 * Mirrors VitePress's own `.VPNavBarMenuLink`.
 *
 * Borrowing the class name is not enough: VitePress styles it with scoped CSS, which
 * only matches elements carrying that component's `data-v-` attribute. Without these
 * declarations the link rendered with no horizontal padding, so the gap to the next item
 * was 12px instead of the 24px every other pair gets, and the type did not match either.
 * Keep in step with VPNavBarMenuLink.vue if VitePress changes it.
 */
.external-nav-link {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.25s;
}

.external-nav-link:hover {
  color: var(--vp-c-brand-1);
}
</style>
