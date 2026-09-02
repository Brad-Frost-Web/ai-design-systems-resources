/**
 * Build stamp, used as a cache-buster on the bundle and stylesheet URLs.
 * The site rebuilds constantly during development; without this a normal
 * reload can pair a fresh page with a stale bundle or corpus and silently
 * drop whole node types from every composed view.
 */
module.exports = () => ({ stamp: Date.now().toString(36) });
