<script setup>
/**
 * A nav link that escapes VitePress's `base`.
 *
 * VitePress prefixes any nav `link` starting with `/` with the site base, so
 * `/tvmjs-site/` would resolve to `/tvmjs-site/docs/tvmjs-site/`. This renders the href verbatim.
 *
 * `target="_self"` is what makes the link work. VitePress's router intercepts every click on
 * a same-origin `<a>` and loads it as a docs page through history.pushState, which for a
 * URL outside the docs base renders nothing and leaves the visitor where they were. It only
 * skips anchors that carry a `target` attribute (router.js), so `_self` hands the click back
 * to the browser for a real navigation. It still opens in the same tab.
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
  <a class="external-nav-link" :href="href" target="_self">
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
