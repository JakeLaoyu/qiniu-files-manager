<script setup lang="ts"></script>

<template>
  <svg
    class="sun-and-moon"
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <mask class="moon" id="moon-mask">
      <rect x="0" y="0" width="100%" height="100%" fill="white" />
      <circle cx="24" cy="10" r="6" fill="black" />
    </mask>
    <circle
      class="sun"
      cx="12"
      cy="12"
      r="6"
      mask="url(#moon-mask)"
      fill="currentColor"
    />
    <g class="sun-beams" stroke="currentColor">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.sun-and-moon {
  --ease-elastic-3: cubic-bezier(0.5, 1.25, 0.75, 1.25);
  --ease-elastic-4: cubic-bezier(0.5, 1.5, 0.75, 1.25);
  --ease-out-5: cubic-bezier(0, 0, 0, 1);
  --ease-3: cubic-bezier(0.25, 0, 0.3, 1);
  --icon-fill: var(--color-text-1);
  --icon-fill-hover: var(--color-text-4);

  stroke-linecap: round;
}

.sun-and-moon > :is(.moon, .sun, .sun-beams) {
  transform-origin: center center;
}

.sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill);
}

.theme-toggle:is(:hover, :focus-visible) > .sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill-hover);
}

.sun-and-moon > .sun-beams {
  stroke: var(--icon-fill);
  stroke-width: 2px;
}

.theme-toggle:is(:hover, :focus-visible) .sun-and-moon > .sun-beams {
  stroke: var(--icon-fill-hover);
}

[arco-theme="dark"] .sun-and-moon > .sun {
  transform: scale(1.75);
}

[arco-theme="dark"] .sun-and-moon > .sun-beams {
  opacity: 0;
}

[arco-theme="dark"] .sun-and-moon > .moon > circle {
  transform: translateX(-7px);
}

@supports (cx: 1) {
  [arco-theme="dark"] .sun-and-moon > .moon > circle {
    transform: translateX(0);
    cx: 17;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .sun-and-moon > .sun {
    transition: transform 0.5s var(--ease-elastic-3);
  }

  .sun-and-moon > .sun-beams {
    transition: transform 0.5s var(--ease-elastic-4), opacity 0.5s var(--ease-3);
  }

  .sun-and-moon .moon > circle {
    transition: transform 0.25s var(--ease-out-5);
  }

  @supports (cx: 1) {
    .sun-and-moon .moon > circle {
      transition: cx 0.25s var(--ease-out-5);
    }
  }
}

[arco-theme="dark"] .sun-and-moon > .sun {
  transform: scale(1.75);
  transition-timing-function: var(--ease-3);
  transition-duration: 0.25s;
}

[arco-theme="dark"] .sun-and-moon > .sun-beams {
  transform: rotateZ(-25deg);
  transition-duration: 0.15s;
}

[arco-theme="dark"] .sun-and-moon > .moon > circle {
  transition-delay: 0.25s;
  transition-duration: 0.5s;
}
</style>
