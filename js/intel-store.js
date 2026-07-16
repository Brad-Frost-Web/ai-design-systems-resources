/**
 * Shared, lazy, once-only loader for the machine-readable corpus index.
 * Every adaptive component reads the same promise, so the network is hit
 * exactly once no matter how many surfaces wake up.
 */
let intelPromise = null;

export function loadIntel() {
	if (!intelPromise) {
		intelPromise = fetch("/intel.json").then((res) => {
			if (!res.ok) throw new Error(`intel.json ${res.status}`);
			return res.json();
		});
	}
	return intelPromise;
}
