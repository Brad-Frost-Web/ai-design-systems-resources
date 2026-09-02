/**
 * Shared, lazy, once-only loader for the machine-readable corpus index.
 * Every adaptive component reads the same promise, so the network is hit
 * exactly once no matter how many surfaces wake up.
 */
let intelPromise = null;

export function loadIntel() {
	if (!intelPromise) {
		// no-cache: the corpus is rebuilt often; a stale copy silently drops whole
		// node types (lessons, terms) from every composed view.
		intelPromise = fetch(`/intel.json?v=${document.documentElement.dataset.build || Date.now().toString(36)}`, { cache: "no-cache" }).then((res) => {
			if (!res.ok) throw new Error(`intel.json ${res.status}`);
			return res.json();
		});
	}
	return intelPromise;
}
