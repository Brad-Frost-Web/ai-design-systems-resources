// Set global icon URL for ed-icon components
globalThis.DS_ICON_URL = "/images/icons/ed-icons.svg";

import "@brad-frost-web/eddie-web-components/components/button/button.js";
import "@brad-frost-web/eddie-web-components/components/header/header.js";
import "@brad-frost-web/eddie-web-components/components/logo/logo.js";
import "@brad-frost-web/eddie-web-components/components/nav-container/nav-container.js";
import "@brad-frost-web/eddie-web-components/components/primary-nav/primary-nav.js";
import "@brad-frost-web/eddie-web-components/components/primary-nav-item/primary-nav-item.js";
import "@brad-frost-web/eddie-web-components/components/layout-container/layout-container.js";
import "@brad-frost-web/eddie-web-components/components/card/card.js";
import "@brad-frost-web/eddie-web-components/components/heading/heading.js";
import "@brad-frost-web/eddie-web-components/components/text-passage/text-passage.js";
import "@brad-frost-web/eddie-web-components/components/main/main.js";
import "@brad-frost-web/eddie-web-components/components/grid/grid.js";
import "@brad-frost-web/eddie-web-components/components/grid-item/grid-item.js";
import "@brad-frost-web/eddie-web-components/components/badge/badge.js";
import "@brad-frost-web/eddie-web-components/components/accordion/accordion.js";
import "@brad-frost-web/eddie-web-components/components/accordion-panel/accordion-panel.js";
import "@brad-frost-web/eddie-web-components/components/toolbar/toolbar.js";
import "@brad-frost-web/eddie-web-components/components/select-field/select-field.js";

// Adaptive layer — Eddie components composed by the resource surfaces
import "@brad-frost-web/eddie-web-components/components/section/section.js";
import "@brad-frost-web/eddie-web-components/components/band/band.js";
import "@brad-frost-web/eddie-web-components/components/search-form/search-form.js";
import "@brad-frost-web/eddie-web-components/components/radio-field/radio-field.js";
import "@brad-frost-web/eddie-web-components/components/radio-field-item/radio-field-item.js";
import "@brad-frost-web/eddie-web-components/components/timeline/timeline.js";
import "@brad-frost-web/eddie-web-components/components/timeline-node/timeline-node.js";
import "@brad-frost-web/eddie-web-components/components/key-value-table/key-value-table.js";
import "@brad-frost-web/eddie-web-components/components/key-value-table-row/key-value-table-row.js";
import "@brad-frost-web/eddie-web-components/components/code/code.js";
import "@brad-frost-web/eddie-web-components/components/alert/alert.js";
import "@brad-frost-web/eddie-web-components/components/skeleton/skeleton.js";

// Eddie's theme switcher/customizer recipe (floating trigger in base.njk)
import "@brad-frost-web/eddie-recipes/recipes/tools/theme-customizer/theme-customizer.js";

// Project-local recipes (light-DOM Lit compositions of the above)
import "./course-hero.js";
import "./recipes/concierge.js";
import "./recipes/adaptive-stage.js";
import "./recipes/constellation.js";
