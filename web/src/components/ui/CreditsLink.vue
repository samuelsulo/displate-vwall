<script setup lang="ts">
/**
 * CreditsLink
 *
 * The small "Credits" pill that sits next to the Kitsune mark in the footer
 * and links to the author's site.
 *
 * Kitsune carries the brand color and the relief (tinted facets, glow). The
 * pill is its deliberate counterpart: flat and neutral, built from the site's
 * text colors rather than the brand palette, so the two read as different
 * things side by side instead of two competing accents. At rest it is a
 * quiet outlined chip; on hover/focus it moves up to the primary text color.
 *
 * Every color is a prop so it follows the client's tokens, and the outline is
 * optional (`outlined`, off by default): a bordered chip suits some sites, while
 * on others it breaks the symmetry of the footer. The visible label is
 * translated copy, so the footer passes it in (the `footer.credits` i18n
 * key); the link target is a fixed company constant.
 */
const CREDITS_URL = 'https://samuelsulo.it'

const props = withDefaults(
  defineProps<{
    /** Translated visible label (footer.credits). */
    label: string
    /** Resting text color. Use the site's secondary text color, not a brand color. */
    color?: string
    /** Text color on hover/focus. Use the site's primary text color. */
    hoverColor?: string
    /** Draw the outline. Off by default: only enable it if the site's own controls are outlined. */
    outlined?: boolean
    /** Pill background. Defaults to a faint tint of `color`; 'none' for no fill. */
    fill?: string
    /** Outline color (only used when `outlined`). Defaults to a soft tint of `color`. */
    borderColor?: string
  }>(),
  {
    color: '#a3a3ad',
    hoverColor: '#f2f2f5',
    outlined: false,
    fill: undefined,
    borderColor: undefined,
  },
)
</script>

<template>
  <a
    class="credits-link"
    :class="{ 'credits-link--outlined': props.outlined }"
    :href="CREDITS_URL"
    target="_blank"
    rel="noopener noreferrer"
    :style="{
      '--credits-color': props.color,
      '--credits-hover-color': props.hoverColor,
      '--credits-fill': props.fill ?? 'color-mix(in srgb, var(--credits-color) 8%, transparent)',
      '--credits-border':
        props.borderColor ?? 'color-mix(in srgb, var(--credits-color) 30%, transparent)',
    }"
  >
    {{ props.label }}
  </a>
</template>

<style scoped>
.credits-link {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--credits-fill);
  color: var(--credits-color);
  font-size: 0.75rem;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition:
    color var(--duration-fast, 140ms) var(--ease-out, ease),
    border-color var(--duration-fast, 140ms) var(--ease-out, ease),
    background-color var(--duration-fast, 140ms) var(--ease-out, ease);
}

.credits-link--outlined {
  border-color: var(--credits-border);
}

.credits-link:hover,
.credits-link:focus-visible {
  background: color-mix(in srgb, var(--credits-hover-color) 10%, transparent);
  color: var(--credits-hover-color);
  text-decoration: none;
}

.credits-link--outlined:hover,
.credits-link--outlined:focus-visible {
  border-color: color-mix(in srgb, var(--credits-hover-color) 55%, transparent);
}

.credits-link:focus-visible {
  outline: 2px solid var(--credits-hover-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .credits-link {
    transition: none;
  }
}
</style>
