import "/js/stats.js";
import { queries } from "/js/queries.js";
import { log, set, get } from "/js/utils.js";

const app = chrome || browser;
const ext_id = "eanofdhdfbcalhflpbdipkjjkoimeeod";
const gumroad_api = "https://api.gumroad.com/v2/licenses";
const product_id = "D-1vxIJJlbq1sZUhTpz70A==";
const bing = "https://www.bing.com/";
const rewards = "https://rewards.bing.com/";
const rewardsFlyout =
	"https://www.bing.com/rewards/panelflyout?channel=bingflyout&partnerId=BingRewards&ru=";
const loading = "/loading.html?type=";
const homepage = "https://buildwithkt.dev/";
// Todo: add once site is live - const tnc = "https://tnc.buildwithkt.dev/rewards-search-automator/";
const tnc =
	"https://getprojects.notion.site/Privacy-Policy-Rewards-Search-Automator-1986977bedc08080a1d2e3a70dcb29e5";
const msDomains = [
	"bing.com",
	"microsoft.com",
	"live.com",
	"office.com",
	"outlook.com",
	"msn.com",
	"windows.com",
	"azure.com",
	"xbox.com",
	"skype.com",
	"microsoftonline.com",
	"sharepoint.com",
];

let config = {
	search: {
		desk: 10,
		mob: 0,
		min: 15,
		max: 30,
	},
	schedule: {
		desk: 0,
		mob: 0,
		min: 15,
		max: 30,
		mode: "m1",
	},
	device: {
		name: "",
		ua: "",
		h: 844,
		w: 390,
		scale: 3,
	},
	control: {
		niche: "random",
		consent: 0,
		clear: 0,
		act: 0,
		log: 0,
	},
	runtime: {
		done: 0,
		total: 0,
		running: 0,
		rsaTab: null,
		mobile: 0,
		act: 0,
	},
	user: {
		country: "",
		countryCode: "",
		city: "",
	},	pro: {
		key: "PREMIUM_UNLOCKED",
		seats: 999,
	},
};
let enableDetailedLogs = config?.control?.log;
let patchRequired = false;
let searchQuery = "";

async function delay(ms, interruptible = true) {
	const functionName = "DELAY";
	if (enableDetailedLogs && ms > 500) {
		log(
			`[${functionName}] - Waiting for ${ms}ms - interruptible: ${interruptible}. `,
			"update",
		);
	} else if (ms > 500) {
		log(`[delay] - Waiting for ${ms}ms. `);
	}
	if (!interruptible) {
		return new Promise((resolve) => {
			setTimeout(() => {
				if (enableDetailedLogs && ms > 500) {
					log(
						`[${functionName}] - Resolved after ${ms}ms - interruptible: ${interruptible}. `,
						"update",
					);
				}
				resolve(true);
			}, ms);
		});
	}

	const checkInterval = 100;
	let intervalId;
	let timeoutId;
	let resolved = false;
	const startTime = Date.now();

	if (!config.runtime.running) {
		if (enableDetailedLogs && ms > 500) {
			log(
				`[${functionName}] - Interrupted early (automation not running) after ${
					Date.now() - startTime
				}ms. `,
				"update",
			);
		}
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		intervalId = setInterval(() => {
			if (!config.runtime.running && !resolved) {
				resolved = true;
				clearInterval(intervalId);
				clearTimeout(timeoutId);

				if (enableDetailedLogs && ms > 500) {
					log(
						`[${functionName}] - Interrupted after ${
							Date.now() - startTime
						}ms.`,
						"update",
					);
				}
				resolve();
			}
		}, checkInterval);

		timeoutId = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				clearInterval(intervalId);

				if (enableDetailedLogs && ms > 500) {
					log(`[${functionName}] - Waited for ${ms}ms.`, "update");
				}
				resolve();
			}
		}, ms);
	});
}

async function resetPro() {
	if (!config) config = await get();
	const functionName = "RESETPRO";
	if (enableDetailedLogs) {
		log(`[${functionName}] - Resetting pro status.`, "update");
	}
	try {
		config.pro.key = "";
		config.pro.seats = 0;
		config.control.niche = "random";
		config.control.act = 0;
		config.schedule.mode = "m1";
		await set(config);
	} catch (error) {
		log(
			`[${functionName}] - Error resetting pro status: ${error.message}`,
			"error",
		);
		throw error;
	}
}

async function resetRuntime() {
	if (!config) config = await get();
	const functionName = "RESETRUNTIME";
	if (enableDetailedLogs) {
		log(`[${functionName}] - Resetting runtime.`, "update");
	}
	try {
		config.runtime.done = 0;
		config.runtime.total = 0;
		config.runtime.running = 0;
		config.runtime.rsaTab = null;
		config.runtime.mobile = 0;
		config.runtime.act = 0;
		await set(config);
		if (enableDetailedLogs) {
			log(`[${functionName}] - Runtime reset successfully.`, "update");
		}
	} catch (error) {
		log(
			`[${functionName}] - Error resetting runtime: ${error.message}`,
			"error",
		);
		throw error;
	}
}

async function reverify() {
	// Premium features unlocked - always return true
	return true;
}

async function setUserGeo() {
	if (!config) config = await get();
	const functionName = "SETUSERGEO";
	if (!navigator.onLine) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No internet connection.`, "update");
		}
		return false;
	}
	if (enableDetailedLogs) {
		log(`[${functionName}] - Setting user geo.`, "update");
	}
	try {
		let geoData = null;
		const res = await fetch("https://ipapi.co/json/");
		if (!res.ok) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Error fetching user geo: ${res.statusText}`,
					"error",
				);
			}
			return false;
		}
		geoData = await res.json();
		if (!geoData || geoData.error) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Invalid geo data: ${JSON.stringify(
						geoData,
					)}`,
					"error",
				);
			}
			return false;
		}
		config.user.country = geoData.country_name || "";
		config.user.countryCode = geoData.country_code || "";
		config.user.city = geoData.city || "";
		await set(config);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - User geo set successfully: ${JSON.stringify(
					config.user,
				)}`,
				"success",
			);
		}
		return true;
	} catch (error) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Error setting user geo: ${error.message}`,
				"error",
			);
		} else {
			log(`[setUserGeo] - Error setting user geo.`);
		}
		return false;
	}
}

async function clear(retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "CLEAR";
	const rsaTab = config?.runtime?.rsaTab;
	let currentUrl = "";
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	if (enableDetailedLogs) {
		log(
			`[${functionName}] - Clearing bing website data with tab: ${rsaTab}`,
			"update",
		);
	}
	try {
		if (rsaTab) {
			try {
				const tab = await app.tabs.get(rsaTab);
				currentUrl = tab.url || bing;
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Current URL: ${currentUrl} updating to ${loading}clear`,
						"update",
					);
				}
				await app.tabs.update(rsaTab, { url: loading + "clear" });
				await wait(rsaTab);
			} catch (error) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Error updating tab URL: ${error.message}`,
						"error",
					);
				} else {
					log(`[clear] - Error updating tab URL.`);
				}
			}
		}
		await app.browsingData.remove(
			{ origins: [bing], since: 0 },
			{
				cacheStorage: true,
				cookies: true,
				serviceWorkers: true,
				localStorage: true,
				pluginData: true,
			},
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Requested data clear for origins: ${JSON.stringify(
					[bing],
				)}, types: ${JSON.stringify({
					cacheStorage: true,
					cookies: true,
					serviceWorkers: true,
					localStorage: true,
					pluginData: true,
				})}`,
				"default",
			);
		}
		if (rsaTab && currentUrl) {
			try {
				await app.tabs.update(rsaTab, { url: currentUrl });
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Updated tab URL back to: ${currentUrl}`,
						"update",
					);
				}
			} catch (error) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Error updating tab URL back: ${error.message}`,
						"error",
					);
				} else {
					log(`[clear] - Error updating tab URL back.`);
				}
			}
		}
		if (patchRequired) {
			patchRequired = false;
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Patch required, resetting patch status.`,
					"update",
				);
			}
		}
		return true;
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error occurred: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return await clear(false, interruptible);
		} else {
			log(
				`[${functionName}] - Error occurred: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function wait(tabId) {
	if (!config) config = await get();
	const functionName = "WAIT";
	const timeout = 5000;

	if (!navigator.onLine) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - No internet connection. Waiting for ${timeout}ms.`,
				"update",
			);
		}
		return false;
	}

	return new Promise(async (resolve) => {
		let isResolved = false;
		let timer = null;

		const done = (
			success,
			message = `Tab ${tabId} loaded successfully`,
		) => {
			if (isResolved) return;
			isResolved = true;
			clearTimeout(timer);
			app.tabs.onUpdated.removeListener(listener);
			log(
				enableDetailedLogs
					? `[${functionName}] - ${message}`
					: `[wait] - ${message}`,
				enableDetailedLogs
					? success
						? "success"
						: "error"
					: undefined,
			);
			resolve(success);
		};

		const listener = (updatedTabId, changeInfo) => {
			if (updatedTabId === tabId && changeInfo.status === "complete") {
				done(true);
			}
		};

		timer = setTimeout(() => {
			done(false, `Tab ${tabId} did not load within ${timeout}ms.`);
		}, timeout);

		try {
			const tab = await app.tabs.get(tabId);
			if (tab.status === "complete") {
				done(true);
			} else {
				app.tabs.onUpdated.addListener(listener);
			}
		} catch (error) {
			done(false, `Error getting tab status: ${error.message}`);
		}
	});
}

function watchTabs(rsaTab) {
	const functionName = "WATCHTABS";
	rsaTab = Number(rsaTab);

	if (enableDetailedLogs) {
		log(
			`[${functionName}] - Watching tabs for MS domain navigations except RSA tab ${rsaTab}.`,
			"update",
		);
	}

	const handleNavigation = ({ tabId, frameId, url }) => {
		tabId = Number(tabId);
		frameId = Number(frameId);

		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Tab ID: ${tabId}, Frame ID: ${frameId}, URL: ${url}`,
				"update",
			);
		}

		// Ignore non-main frames of RSA tab
		if (tabId === rsaTab && frameId !== 0) {
			return;
		} else if (tabId === rsaTab) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - RSA Tab navigated to ${url}`,
					"update",
				);
			}
			return;
		}

		if (
			url &&
			msDomains.some((domain) => url.includes(domain)) &&
			config?.runtime?.running &&
			config?.runtime?.mobile &&
			config?.control?.clear &&
			tabId !== rsaTab &&
			!config?.runtime?.act
		) {
			patchRequired = true;
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Navigation to MS domain detected at tab ${tabId}, patchRequired set to true.`,
					"warning",
				);
			} else {
				log(`[watchTabs] - Navigation to MS domain detected.`);
			}
		}
	};

	app.webNavigation.onCommitted.addListener(handleNavigation);
}

async function isDebuggerAttached(tabId) {
	try {
		const targets = await chrome.debugger.getTargets();
		return targets.some(
			(target) =>
				target.type === "page" &&
				target.tabId === tabId &&
				target.attached,
		);
	} catch (error) {
		console.error(`[isDebuggerAttached] - Error: ${error.message}`);
		return false;
	}
}

async function attach(tabId, retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "ATTACH";
	const timeout = 5000;

	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs)
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"warning",
			);
		return false;
	}

	// Check if debugger is already attached
	const isAttached = await isDebuggerAttached(tabId);
	if (isAttached) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Debugger is already attached to tab: ${tabId}.`,
				"update",
			);
		}
		return true;
	}

	try {
		const tab = await app.tabs.get(tabId);
		const currentUrl = tab?.url || "";

		if (enableDetailedLogs)
			log(
				`[${functionName}] - Attaching to tab: ${tabId}. Current URL: ${currentUrl}`,
			);

		// Update tab to loading page (make sure loading var is defined)
		await app.tabs.update(tabId, { url: loading + "attach" });
		await wait(tabId);

		// Attach debugger with manual timeout
		await promiseWithTimeout(
			app.debugger.attach({ tabId }, "1.3").catch((err) => {
				if (err.message?.includes("Another debugger")) {
					log(
						`[${functionName}] - Another debugger is already attached.`,
						"warning",
					);
				}
				throw err;
			}),
			timeout,
			`${functionName} - Timeout while attaching to tab: ${tabId}`,
		);

		if (enableDetailedLogs)
			log(
				`[${functionName}] - Successfully attached to tab: ${tabId}`,
				"success",
			);

		await delay(500, interruptible);

		// Send Target.setAutoAttach command with timeout
		await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "Target.setAutoAttach", {
				autoAttach: true,
				waitForDebuggerOnStart: false,
				flatten: true,
			}),
			timeout,
			`${functionName} - Timeout while sending Target.setAutoAttach command for tab: ${tabId}`,
		);

		if (enableDetailedLogs)
			log(
				`[${functionName}] - Target.setAutoAttach sent for tab: ${tabId}`,
				"success",
			);

		await delay(500, interruptible);

		if (currentUrl) {
			await app.tabs.update(tabId, { url: currentUrl });
			await wait(tabId);
			if (enableDetailedLogs)
				log(
					`[${functionName}] - Tab URL restored to: ${currentUrl}`,
					"success",
				);
		}

		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Attach complete for tab: ${tabId}`,
				"success",
			);
		}

		return true;
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return attach(tabId, false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function simulate(tabId, retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "SIMULATE";
	const timeout = 5000;

	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	try {
		// Check if debugger is already attached
		const isAttached = await isDebuggerAttached(tabId);
		if (!isAttached) {
			await attach(tabId, retry, interruptible);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Debugger attached to tab: ${tabId}.`,
					"update",
				);
			}
		}
		const tab = await app.tabs.get(tabId);
		const currentUrl = tab?.url || "";
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Simulating tab: ${tabId}. Current URL: ${currentUrl}`,
			);
		}
		// Update tab to loading page (make sure loading var is defined)
		await app.tabs.update(tabId, { url: loading + "simulate" });
		await wait(tabId);

		// Emulation.clearDeviceMetricsOverride
		await promiseWithTimeout(
			app.debugger.sendCommand(
				{ tabId },
				"Emulation.clearDeviceMetricsOverride",
			),
			timeout,
			`${functionName} - Timeout while sending Emulation.clearDeviceMetricsOverride command for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Emulation.clearDeviceMetricsOverride sent for tab: ${tabId}`,
				"success",
			);
		}

		const deviceMetrics = {
			mobile: true,
			fitWindow: true,
			width: config?.device?.w || 390,
			height: config?.device?.h || 844,
			deviceScaleFactor: config?.device?.scale || 3,
		};

		// Emulation.setDeviceMetricsOverride
		await promiseWithTimeout(
			app.debugger.sendCommand(
				{ tabId },
				"Emulation.setDeviceMetricsOverride",
				deviceMetrics,
			),
			timeout,
			`${functionName} - Timeout while sending Emulation.setDeviceMetricsOverride command for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Emulation.setDeviceMetricsOverride sent for tab: ${tabId}`,
				"success",
			);
		}

		const userAgent =
			config?.device?.ua ||
			"Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
		// Network.setUserAgentOverride
		await promiseWithTimeout(
			app.debugger.sendCommand(
				{ tabId },
				"Network.setUserAgentOverride",
				{
					userAgent,
					deviceScaleFactor: deviceMetrics.deviceScaleFactor,
				},
			),
			timeout,
			`${functionName} - Timeout while sending Network.setUserAgentOverride command for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Network.setUserAgentOverride sent for tab: ${tabId}`,
				"success",
			);
		}
		// Emulation.setTouchEmulationEnabled
		await promiseWithTimeout(
			app.debugger.sendCommand(
				{ tabId },
				"Emulation.setTouchEmulationEnabled",
				{
					enabled: true,
					configuration: "mobile",
					maxTouchPoints: 10,
				},
			),
			timeout,
			`${functionName} - Timeout while sending Emulation.setTouchEmulationEnabled command for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Emulation.setTouchEmulationEnabled sent for tab: ${tabId}`,
				"success",
			);
		}

		// Emulation.setEmitTouchEventsForMouse
		await promiseWithTimeout(
			app.debugger.sendCommand(
				{ tabId },
				"Emulation.setEmitTouchEventsForMouse",
				{
					enabled: true,
					configuration: "mobile",
				},
			),
			timeout,
			`${functionName} - Timeout while sending Emulation.setEmitTouchEventsForMouse command for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Emulation.setEmitTouchEventsForMouse sent for tab: ${tabId}`,
				"success",
			);
		}
		await delay(500, interruptible);
		if (currentUrl) {
			await app.tabs.update(tabId, { url: currentUrl });
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Tab URL restored to: ${currentUrl}`,
					"success",
				);
			}
		}
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Simulate complete for tab: ${tabId} with URL: ${currentUrl} for ${config?.device?.name}`,
				"success",
			);
		}
		return true;
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return simulate(tabId, false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function detach(tabId, retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "DETACH";
	const timeout = 5000;
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	try {
		const isAttached = await isDebuggerAttached(tabId);
		if (!isAttached) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Debugger is not attached to tab: ${tabId}.`,
					"update",
				);
			}
			return true;
		}
		const tab = await app.tabs.get(tabId);
		const currentUrl = tab?.url || "";
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Detaching from tab: ${tabId}. Current URL: ${currentUrl}`,
			);
		}
		// Update tab to loading page (make sure loading var is defined)
		await app.tabs.update(tabId, { url: loading + "detach" });
		await wait(tabId);
		const resetCommands = [
			["Emulation.clearDeviceMetricsOverride", {}],
			["Network.setUserAgentOverride", { userAgent: "" }],
			["Emulation.setUserAgentOverride", { userAgent: "" }],
			["Network.setBypassServiceWorker", { bypass: false }],
			["Emulation.setTouchEmulationEnabled", { enabled: false }],
			["Emulation.setEmitTouchEventsForMouse", { enabled: false }],
		];
		for (const [command, params] of resetCommands) {
			try {
				await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, command, params),
					timeout,
					`${functionName} - Timeout while sending ${command} command for tab: ${tabId}`,
				);
			} catch (err) {
				log(
					`[detach] Failed to send ${command} on tab ${tabId}: ${err.message}`,
					"pause",
				);
			}
		}
		await delay(500, interruptible);
		// Detach debugger with manual timeout
		await promiseWithTimeout(
			app.debugger.detach({ tabId }),
			timeout,
			`${functionName} - Timeout while detaching from tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Successfully detached from tab: ${tabId}`,
				"success",
			);
		}
		await delay(500, interruptible);
		// Clean up any remaining resources
		if (currentUrl) {
			await app.tabs.update(tabId, { url: currentUrl });
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Tab URL restored to: ${currentUrl}`,
					"success",
				);
			}
		}
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Detach complete for tab: ${tabId} with URL: ${currentUrl}`,
				"success",
			);
		}
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return detach(tabId, false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function toggleSimulate(retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "TOGGLESIMULATE";
	if (enableDetailedLogs) {
		log(
			`[${functionName}] - Toggling simulate mode. Interruptible: ${interruptible}`,
			"update",
		);
	}

	try {
		const tabs = await app.tabs.query({
			active: true,
			currentWindow: true,
		});
		const tabId = tabs[0]?.id;
		const currentUrl = tabs[0]?.url || "";

		if (!currentUrl || !tabId) {
			log(
				enableDetailedLogs
					? `[${functionName}] - No active tab found. Cannot toggle simulate mode.`
					: `[toggleSimulate] - No active tab found.`,
				"error",
			);
			return false;
		}

		enableDetailedLogs &&
			log(
				`[${functionName}] - Current URL: ${currentUrl} - Tab ID: ${tabId}`,
				"update",
			);

		const isAttached = await isDebuggerAttached(tabId);

		if (isAttached) {
			await detach(tabId, true, false);
			enableDetailedLogs &&
				log(
					`[${functionName}] - Debugger detached from tab: ${tabId}.`,
					"update",
				);
		} else {
			await attach(tabId, true, false);
			enableDetailedLogs &&
				log(
					`[${functionName}] - Debugger attached to tab: ${tabId}.`,
					"update",
				);

			await delay(500, interruptible);
			await simulate(tabId, true, false);

			enableDetailedLogs &&
				log(
					`[${functionName}] - Simulate mode enabled for tab: ${tabId}.`,
					"update",
				);
		}

		if (currentUrl) {
			await app.tabs.update(tabId, { url: currentUrl });
			await wait(tabId);
			enableDetailedLogs &&
				log(
					`[${functionName}] - Tab URL restored to: ${currentUrl}`,
					"update",
				);
		}

		return true; // ✅ Final return after successful operation
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return toggleSimulate(false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function click(retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "CLICK";
	const timeout = 3000;
	const tabId = Number(config.runtime.rsaTab);
	const tab = await app.tabs.get(tabId);
	const currentUrl = tab?.url || "";
	// Ensure enableDetailedLogs is defined here, as it's used throughout
	const enableDetailedLogs = config?.control?.log;

	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}

	try {
		const domainsToEnable = ["Page", "Runtime", "DOM"]; // Added "Input" as you're using it later
		for (const domain of domainsToEnable) {
			if (enableDetailedLogs) {
				log(
					`Enabling debugger domain: ${domain} for tab ${tabId}.`,
					"update",
				);
			}
			await promiseWithTimeout(
				app.debugger.sendCommand({ tabId }, `${domain}.enable`, {}),
				timeout,
				`${functionName} - Timeout while enabling ${domain} domain for tab: ${tabId}`,
			);
		}
		await delay(500, interruptible);

		const selector = config.runtime.mobile
			? "#mHamburger"
			: "a#id_rh_w .b_clickarea";

		const { root: documentNode } = await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "DOM.getDocument", {}),
			timeout,
			`${functionName} - Timeout while getting document root for tab: ${tabId}`,
		);

		if (!documentNode || !documentNode.nodeId) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Failed to get document root for tab: ${tabId}`,
					"error",
				);
			}
			return false;
		}

		// 2. Get the nodeId for the specific selector within the document
		const { nodeId } = await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "DOM.querySelector", {
				nodeId: documentNode.nodeId, // Use the dynamically retrieved documentNode.nodeId here
				selector,
			}),
			timeout,
			`${functionName} - Timeout while querying selector: ${selector}`,
		);

		if (!nodeId) {
			if (enableDetailedLogs) {
				// Added this check for consistency with other logs
				log(
					`[${functionName}] - Node not found for selector: ${selector}`,
					"error",
				);
			}
			return false;
		}

		// 3. Scroll the element into view (this is good practice)
		await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "DOM.scrollIntoViewIfNeeded", {
				nodeId,
			}),
			timeout,
			`${functionName} - Timeout while scrolling into view node: ${nodeId}`,
		);
		await delay(500, interruptible); // Give page a moment to settle after scroll

		// 4. Get the box model
		const { model } = await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "DOM.getBoxModel", {
				nodeId,
			}),
			timeout,
			`${functionName} - Timeout while getting box model for node: ${nodeId}`,
		);

		if (!model) {
			// Check if model was returned successfully
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Box model not returned for element with selector: ${selector}`,
					"error",
				);
			}
			return false;
		}

		// Extract coordinates from model.content quad
		// model.content is an array of 8 numbers: [x1, y1, x2, y2, x3, y3, x4, y4]
		// representing the 4 corners (top-left, top-right, bottom-right, bottom-left)
		const [x1, y1, x2, y2, x3, y3, x4, y4] = model.content;

		// Calculate min/max to get true bounding box, as element might be rotated or skewed
		const left = Math.min(x1, x2, x3, x4);
		const top = Math.min(y1, y2, y3, y4);
		const width = Math.max(x1, x2, x3, x4) - left;
		const height = Math.max(y1, y2, y3, y4) - top;

		if (enableDetailedLogs) {
			log(
				`[${functionName}] - BoxModel: top=${top}, left=${left}, width=${width}, height=${height}`,
				"update",
			);
		}

		// Calculate random point within the element for clicking
		const x = Math.floor(left + Math.random() * width);
		const y = Math.floor(top + Math.random() * height);

		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Calculated click position: (${x}, ${y}).`,
				"update",
			);
		}

		// --- END OF CORRECTED DOM.getBoxModel SECTION ---

		// The rest of your click dispatch logic (Input.dispatchTouchEvent/MouseEvent)
		// now uses the correctly calculated 'x' and 'y'
		if (config?.runtime?.mobile) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Simulating touch event for mobile.`,
					"update",
				);
			}
			await promiseWithTimeout(
				app.debugger.sendCommand(
					{ tabId },
					"Input.dispatchTouchEvent",
					{
						type: "touchStart",
						touchPoints: [
							{
								x,
								y,
								radiusX: 1,
								radiusY: 1,
								forces: Math.random() * 0.5 + 0.5,
							},
						],
					},
				),
				timeout,
				`${functionName} - Timeout while dispatching touch event for tab: ${tabId}`,
			);
			await delay(80 + Math.random() * 120, interruptible);
			await promiseWithTimeout(
				app.debugger.sendCommand(
					{ tabId },
					"Input.dispatchTouchEvent",
					{
						type: "touchEnd",
						touchPoints: [],
					},
				),
				timeout,
				`${functionName} - Timeout while dispatching touch event for tab: ${tabId}`,
			);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Touch event dispatched for mobile.`,
					"success",
				);
			}
			await delay(80 + Math.random() * 120, interruptible);
		} else {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Simulating mouse event for desktop.`,
					"update",
				);
			}
			await promiseWithTimeout(
				app.debugger.sendCommand(
					{ tabId },
					"Input.dispatchMouseEvent",
					{
						type: "mouseMoved",
						x,
						y,
					},
				),
				timeout,
				`${functionName} - Timeout while dispatching mouseMoved event for tab: ${tabId}`,
			);
			await delay(80 + Math.random() * 120, interruptible);
			await promiseWithTimeout(
				app.debugger.sendCommand(
					{ tabId },
					"Input.dispatchMouseEvent",
					{
						type: "mousePressed",
						button: "left",
						x,
						y,
						clickCount: 1,
					},
				),
				timeout,
				`${functionName} - Timeout while dispatching mouse press event for tab: ${tabId}`,
			);
			await delay(50 + Math.random() * 50, interruptible);
			await promiseWithTimeout(
				app.debugger.sendCommand(
					{ tabId },
					"Input.dispatchMouseEvent",
					{
						type: "mouseReleased",
						button: "left",
						x,
						y,
						clickCount: 1,
					},
				),
				timeout,
				`${functionName} - Timeout while dispatching mouse release event for tab: ${tabId}`,
			);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Mouse event dispatched for desktop.`,
					"success",
				);
			}
			await delay(80 + Math.random() * 120, interruptible);
		}
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Click event dispatched successfully.`,
				"success",
			);
		} else {
			log(`[click] - Click event dispatched successfully.`);
		}
		return true;
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying with alternate method...`,
				"warning",
			);
			await app.tabs.update(tabId, {
				url: rewardsFlyout + encodeURIComponent(currentUrl),
			});
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Updated tab URL to: ${rewardsFlyout}${encodeURIComponent(
						currentUrl,
					)}`,
					"update",
				);
			}
			await delay(1000, interruptible);
			await app.tabs.update(tabId, { url: currentUrl });
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Updated tab URL back to: ${currentUrl}`,
					"update",
				);
			}
			await delay(1000, interruptible);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Successfully retried alternate method for login.`,
					"success",
				);
			}
			return true;
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

async function query(retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "QUERY";
	const timeout = 1000;
	const tabId = Number(config.runtime.rsaTab);
	const tab = await app.tabs.get(tabId);
	const currentUrl = tab?.url || bing;
	let niche = config?.runtime?.niche || "random";
	const categories = Object.keys(queries);
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	if (niche === "random") {
		niche = categories[Math.floor(Math.random() * categories.length)];
	}
	let queryList = queries[niche];
	searchQuery = queryList[Math.floor(Math.random() * queryList.length)];
	const currentYear = new Date().getFullYear();
	searchQuery = searchQuery
		.replace("[year]", currentYear.toString())
		.replace("[country]", config?.runtime?.country);
	searchQuery = addErrors(searchQuery);
	if (enableDetailedLogs) {
		log(
			`[${functionName}] - Generated search query: ${searchQuery} for niche: ${niche}`,
			"update",
		);
	}
	try {
		const domainsToEnable = ["Page", "Runtime", "DOM"];
		for (const domain of domainsToEnable) {
			if (enableDetailedLogs) {
				log(
					`Enabling debugger domain: ${domain} for tab ${tabId}.`,
					"update",
				);
			}
			await promiseWithTimeout(
				app.debugger.sendCommand({ tabId }, `${domain}.enable`, {}),
				timeout,
				`${functionName} - Timeout while enabling ${domain} domain for tab: ${tabId}`,
			);
		}
		await delay(500, interruptible);
		const step1 = `(function() {
            const input = document.querySelector("#sb_form_q") ||
                          document.querySelector("textarea[name='q']") ||
                          document.querySelector("input[name='q']");
            if (input) {
                input.focus();
                input.value = "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                return true;
            }
            return false;
        })();`;
		await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
				expression: step1,
				returnByValue: true,
				awaitPromise: true,
			}),
			timeout,
			`${functionName} - Timeout while executing step 1 for tab: ${tabId}`,
		);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Input field found for query and past query is cleared and focused the element. Current URL: ${currentUrl}`,
				"update",
			);
		}
		await delay(500, interruptible);
		for (const char of searchQuery) {
			if (!config?.runtime?.running) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Interrupted early (automation not running).`,
						"update",
					);
				}
				return false;
			}
			if (config?.runtime?.mobile) {
				await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, "Input.insertText", {
						text: char,
					}),
					timeout,
					`${functionName} - Timeout while dispatching key event for tab: ${tabId}`,
				);
				await delay(80 + Math.random() * 120, interruptible);
			} else {
				await promiseWithTimeout(
					app.debugger.sendCommand(
						{ tabId },
						"Input.dispatchKeyEvent",
						{
							type: "keyDown",
							key: char,
							text: char,
							unmodifiedText: char,
							modifiers: 0,
							nativeVirtualKeyCode: char.charCodeAt(0),
							windowsVirtualKeyCode: char.charCodeAt(0),
						},
					),
					timeout,
					`${functionName} - Timeout while dispatching key event for tab: ${tabId}`,
				);
				await delay(80 + Math.random() * 120, interruptible);
				await promiseWithTimeout(
					app.debugger.sendCommand(
						{ tabId },
						"Input.dispatchKeyEvent",
						{
							type: "keyUp",
							key: char,
							text: char,
							modifiers: 0,
							unmodifiedText: char,
							nativeVirtualKeyCode: char.charCodeAt(0),
							windowsVirtualKeyCode: char.charCodeAt(0),
						},
					),
					timeout,
					`${functionName} - Timeout while dispatching key event for tab: ${tabId}`,
				);
				await delay(80 + Math.random() * 120, interruptible);
			}
		}
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Search query dispatched successfully: ${searchQuery}`,
				"success",
			);
		}
		return true;
	} catch (error) {
		if (retry) {
			await app.tabs.update(tabId, {
				active: true,
			});
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Error: ${error.message}. Retrying...`,
					"warning",
				);
			}
			await delay(1000, interruptible);
			return query(false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

function addErrors(
	query,
	errorRate = 0.005,
	swapRate = 0.005,
	chancesOfError = 0.1,
) {
	if (Math.random() > chancesOfError) return query;
	const keyboardMap = {
		a: ["s", "q", "w", "z"],
		b: ["v", "g", "h", "n"],
		c: ["x", "d", "f", "v"],
		d: ["s", "e", "r", "f", "c", "x"],
		e: ["w", "s", "d", "r"],
		f: ["d", "r", "t", "g", "v", "c"],
		g: ["f", "t", "y", "h", "b", "v"],
		h: ["g", "y", "u", "j", "n", "b"],
		i: ["u", "j", "k", "o"],
		j: ["h", "u", "i", "k", "m", "n"],
		k: ["j", "i", "o", "l", "m"],
		l: ["k", "o", "p"],
		m: ["n", "j", "k"],
		n: ["b", "h", "j", "m"],
		o: ["i", "k", "l", "p"],
		p: ["o", "l"],
		q: ["a", "w"],
		r: ["e", "d", "f", "t"],
		s: ["a", "w", "e", "d", "x", "z"],
		t: ["r", "f", "g", "y"],
		u: ["y", "h", "j", "i"],
		v: ["c", "f", "g", "b"],
		w: ["q", "a", "s", "e"],
		x: ["z", "s", "d", "c"],
		y: ["t", "g", "h", "u"],
		z: ["a", "s", "x"],
	};
	const getNearbyChar = (char) => {
		const lower = char.toLowerCase();
		const neighbors = keyboardMap[lower];
		if (!neighbors || neighbors.length === 0) return char;
		const swap = neighbors[Math.floor(Math.random() * neighbors.length)];
		return char === lower ? swap : swap.toUpperCase();
	};
	let result = "";
	let errorCount = 0;
	for (let i = 0; i < query.length; i++) {
		let char = query[i];
		// Skip chance (omit a character)
		if (
			Math.random() < errorRate &&
			errorCount < 2 &&
			/[a-zA-Z]/.test(char)
		) {
			errorCount++;
			continue;
		}
		// Duplicate chance
		if (
			Math.random() < errorRate &&
			errorCount < 2 &&
			/[a-zA-Z]/.test(char)
		) {
			result += char;
			errorCount++;
		}
		// Swap with nearby key
		if (
			Math.random() < swapRate &&
			errorCount < 2 &&
			/[a-zA-Z]/.test(char)
		) {
			result += getNearbyChar(char);
			errorCount++;
		} else {
			result += char;
		}
	}
	return result;
}

async function perform(retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "PERFORM";
	const timeout = 3000;
	const tabId = Number(config.runtime.rsaTab);
	const tab = await app.tabs.get(tabId);
	const currentUrl = tab?.url || bing;
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	try {
		const domainsToEnable = ["Page", "Runtime", "DOM"];
		for (const domain of domainsToEnable) {
			if (enableDetailedLogs) {
				log(
					`Enabling debugger domain: ${domain} for tab ${tabId}.`,
					"update",
				);
			}
			await promiseWithTimeout(
				app.debugger.sendCommand({ tabId }, `${domain}.enable`, {}),
				timeout,
				`${functionName} - Timeout while enabling ${domain} domain for tab: ${tabId}`,
			);
		}
		await delay(500, interruptible);
		const searchExpression = `(function() {
			const safeQuery = ${JSON.stringify(searchQuery)};
			const input = document.querySelector("#sb_form_q") ||
						document.querySelector("textarea[name='q']") ||
						document.querySelector("input[name='q']");
			if (!input) return 'No input found';

			const form = input.closest("form");
			if (!form) return 'No form found';

			input.focus();
			input.value = safeQuery;
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));

			if (form.elements?.q && form.elements.q !== input) {
				form.elements.q.value = safeQuery;
			}

			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
			input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));

			form.submit();
			return 'Search performed via form submit';
		})();`;

		const { result } = await promiseWithTimeout(
			app.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
				expression: searchExpression,
				returnByValue: true,
				awaitPromise: true,
			}),
			timeout,
			`${functionName} - Timeout while executing search expression for tab: ${tabId}`,
		);
		if (result?.value === "No input found") {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Input field not found for query. Current URL: ${currentUrl}`,
					"error",
				);
			}
			return false;
		} else if (result?.value === "No form found") {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Form not found for query. Current URL: ${currentUrl}`,
					"error",
				);
			}
			return false;
		}
		const didWaitSucceed = await wait(tabId);
		if (!didWaitSucceed) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Timed out waiting for tab to load after search.`,
					"error",
				);
			}
			return false;
		}
		await delay(1000, interruptible);
		const newTab = await app.tabs.get(tabId);
		const newUrl = newTab?.url || bing;
		if (newUrl !== currentUrl) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Search performed. URL changed from ${currentUrl} to ${newUrl}`,
					"success",
				);
			}
			return true;
		} else {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Search performed. URL remains the same: ${currentUrl}`,
					"error",
				);
			}
			return false;
		}
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return perform(false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	}
}

// Helper to add timeout to a promise
function promiseWithTimeout(promise, ms, errorMsg) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
		promise.then(
			(res) => {
				clearTimeout(timer);
				resolve(res);
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			},
		);
	});
}

async function search(searches, min, max, interruptible = true) {
	if (!config) config = await get();
	const functionName = "SEARCH";
	const timeout = 3000;
	const tabId = Number(config.runtime.rsaTab);
	const tab = await app.tabs.get(tabId);
	const currentUrl = tab?.url || bing;
	const clearIt = config?.control?.clear;
	let retryCount = 0;
	const maxRetries = 3;
	if (!navigator.onLine) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No internet connection.`, "update");
		}
		return false;
	}
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	if (searches === undefined || searches === null || searches === 0) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No searches to perform.`, "update");
		}
		return false;
	}
	try {
		if (clearIt) await clear();
		const currentTab = await app.tabs.get(tabId);
		const currentUrl = currentTab?.url;
		if (currentUrl !== bing) {
			await app.tabs.update(tabId, { url: bing });
			await wait(tabId);
		}
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Updated tab URL to: ${bing} - Searches: ${searches}`,
				"update",
			);
		}
		await delay(500, interruptible);
		// Perform the search
		for (let i = 0; i < searches; i++) {
			if (interruptible && !config.runtime.running) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Interrupted early (automation not running).`,
						"update",
					);
				}
				return false;
			}
			if (!navigator.onLine) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - No internet connection.`,
						"update",
					);
				}
				return false;
			}
			if (patchRequired) await clear();
			const randomDelay =
				Math.floor(Math.random() * (max * 1000 - min * 1000 + 1)) +
				min * 1000;
			const reduceDelay = config.control.clear && i < 3 ? 6000 : 3000;
			if (clearIt && i < 3) {
				await app.tabs.update(tabId, {
					active: true,
				});
				await delay(3000);
				await click();
				await delay(2000);
				if (config?.runtime?.mobile) {
					await click();
				}
				await delay(1000);
			}
			const didQuerySucceed = await query();
			if (!didQuerySucceed) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Query failed: ${searchQuery} at index ${
							i + 1
						}.`,
						"error",
					);
				}
				retryCount++;
				if (retryCount >= maxRetries) {
					log(
						enableDetailedLogs
							? `[${functionName}] - Max retries reached. Stopping search.`
							: `[search] - Max retries reached.`,
						enableDetailedLogs ? "error" : undefined,
					);
					return false;
				}
				i--;
				continue;
			}
			await delay(randomDelay - reduceDelay);
			config = await get();
			const didSearchPerformed = await perform();
			if (!didSearchPerformed) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Search failed: ${searchQuery} at index ${
							i + 1
						}.`,
						"error",
					);
				}
				await app.tabs.update(tabId, {
					active: true,
					url: bing,
				});
				await wait(tabId);
				retryCount++;
				if (retryCount >= maxRetries) {
					log(
						enableDetailedLogs
							? `[${functionName}] - Max retries reached. Stopping search.`
							: `[search] - Max retries reached.`,
						enableDetailedLogs ? "error" : undefined,
					);
					return false;
				}
				i--;
				continue;
			} else {
				retryCount = 0; // Reset retry count on success
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Search performed successfully: ${searchQuery}`,
						"success",
					);
				} else {
					log(`[search] - Search performed successfully.`);
				}
				config.runtime.done++;
				await app.action.setBadgeText({
					text:
						Math.round(
							(config.runtime.done / config.runtime.total) * 100,
						) + "%",
				});
				await set(config);
			}
			if (i === searches - 1) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Waiting for the last search to complete.`,
						"update",
					);
				}
				await delay(randomDelay);
			} else {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Waiting for 3000ms before next search.`,
						"update",
					);
				}
				await delay(3000);
			}
		}
		return true; // ✅ Final return after successful operation
	} catch (error) {
		log(
			enableDetailedLogs
				? `[${functionName}] - Error occurred: ${error.message}`
				: `[search] - Error occurred.`,
			enableDetailedLogs ? "error" : undefined,
		);
		return false;
	}
}

async function activity(tabId, retry = true, interruptible = true) {
	if (!config) config = await get();
	const functionName = "ACTIVITY";
	const timeout = 3000;
	const tab = await app.tabs.get(tabId);
	const currentUrl = tab?.url;
	if (!navigator.onLine) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No internet connection.`, "update");
		}
		return false;
	}
	if (interruptible && !config.runtime.running) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Interrupted early (automation not running).`,
				"update",
			);
		}
		return false;
	}
	if (currentUrl !== rewards) {
		await app.tabs.update(tabId, { url: rewards });
		await wait(tabId);
	}
	try {
		await attach(tabId);
		config.runtime.act = 1;
		await set(config);
		while (true) {
			await app.action.setBadgeText({ text: "👀" });
			await app.action.setBadgeBackgroundColor({ color: "#0072FF" });
			if (!navigator.onLine) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - No internet connection.`,
						"update",
					);
				}
				return false;
			}
			if (interruptible && !config.runtime.running) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Interrupted early (automation not running).`,
						"update",
					);
				}
				return false;
			}
			const domainsToEnable = ["Page", "Runtime", "DOM"];
			for (const domain of domainsToEnable) {
				if (enableDetailedLogs) {
					log(
						`Enabling debugger domain: ${domain} for tab ${tabId}.`,
						"update",
					);
				}
				await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, `${domain}.enable`, {}),
					timeout,
					`${functionName} - Timeout while enabling ${domain} domain for tab: ${tabId}`,
				);
			}
			await delay(500, interruptible);
			await app.tabs.update(tabId, {
				url: rewards,
				active: true,
			});
			await wait(tabId);
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Updated tab URL to: ${rewards} - Tab ID: ${tabId}`,
					"update",
				);
			}
			await delay(500, interruptible);

			const {
				root: { nodeId: docNodeId },
			} = await promiseWithTimeout(
				app.debugger.sendCommand({ tabId }, "DOM.getDocument", {}),
				timeout,
				`${functionName} - Timeout while getting document for tab: ${tabId}`,
			);

			const { nodeIds: cardNodes } = await promiseWithTimeout(
				app.debugger.sendCommand({ tabId }, "DOM.querySelectorAll", {
					nodeId: docNodeId,
					selector: ".c-card-content",
				}),
				timeout,
				`${functionName} - Timeout while querying card nodes for tab: ${tabId}`,
			);

			let clicked = false;

			for (const nodeId of cardNodes) {
				const { nodeId: addIcon } = await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, "DOM.querySelector", {
						nodeId,
						selector: ".mee-icon-AddMedium",
					}),
					timeout,
					`${functionName} - Timeout while querying add icon for tab: ${tabId}`,
				);
				if (!addIcon) continue;

				const { nodeId: safeImage } = await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, "DOM.querySelector", {
						nodeId,
						selector: "mee-safe-image",
					}),
					timeout,
					`${functionName} - Timeout while querying safe image for tab: ${tabId}`,
				);
				if (safeImage) continue;
				// scroll element into view

				await app.action.setBadgeText({ text: "😄" });
				await app.action.setBadgeBackgroundColor({ color: "#0072FF" });
				await promiseWithTimeout(
					app.debugger.sendCommand(
						{ tabId },
						"DOM.scrollIntoViewIfNeeded",
						{
							nodeId,
						},
					),
					timeout,
					`${functionName} - Timeout while scrolling element into view for tab: ${tabId}`,
				);
				await delay(500, interruptible);
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Scrolled element into view.`,
						"update",
					);
				}
				// get element getBoxModel
				const { model } = await promiseWithTimeout(
					app.debugger.sendCommand({ tabId }, "DOM.getBoxModel", {
						nodeId,
					}),
					timeout,
					`${functionName} - Timeout while getting box model for tab: ${tabId}`,
				);
				const quad = model?.content;
				const x = (quad[0] + quad[2]) / 2;
				const y = (quad[1] + quad[5]) / 2;
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Clickable element found. Coordinates: (${x}, ${y})`,
						"update",
					);
				}
				const existingTabs = await app.tabs.query({});
				await delay(500, interruptible);
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Found ${existingTabs.length} existing tabs.`,
						"update",
					);
				}
				await promiseWithTimeout(
					app.debugger.sendCommand(
						{ tabId },
						"Input.dispatchMouseEvent",
						{
							type: "mousePressed",
							button: "left",
							x,
							y,
							clickCount: 1,
						},
					),
					timeout,
					`${functionName} - Timeout while dispatching mouse press event for tab: ${tabId}`,
				);
				await delay(80 + Math.random() * 120, interruptible);
				await promiseWithTimeout(
					app.debugger.sendCommand(
						{ tabId },
						"Input.dispatchMouseEvent",
						{
							type: "mouseReleased",
							button: "left",
							x,
							y,
							clickCount: 1,
						},
					),
					timeout,
					`${functionName} - Timeout while dispatching mouse release event for tab: ${tabId}`,
				);
				clicked = true;
				await delay(5000 + Math.random() * 5000);
				const allTabs = await app.tabs.query({});
				const newTab = allTabs.find(
					(t) => !existingTabs.find((e) => e.id === t.id),
				);
				if (newTab) {
					// activity tab was created and now closing it
					await app.tabs.remove(newTab.id);
					if (enableDetailedLogs) {
						log(
							`[${functionName}] - New activity tab created and closed: ${newTab.url}`,
							"success",
						);
					}
				}
				break;
			}
			if (!clicked) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - No clickable activity cards found. All activity cards are already clicked.`,
						"success",
					);
				}
				return true;
			}
		}
	} catch (error) {
		if (retry) {
			log(
				`[${functionName}] - Error: ${error.message}. Retrying...`,
				"warning",
			);
			await delay(1000, interruptible);
			return activity(tabId, false, interruptible);
		} else {
			log(
				`[${functionName}] - Error: ${error.message}. Giving up...`,
				"error",
			);
			throw error;
		}
	} finally {
		await app.action.setBadgeText({ text: "" });
		config.runtime.act = 0;
		await set(config);
	}
}

async function initialize(searches) {
	if (!config) config = await get();
	enableDetailedLogs = config?.control?.log;
	const functionName = "INITIALIZE";
	const timeout = 3000;
	let tabId = null;
	if (!navigator.onLine) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No internet connection.`, "update");
		}
		return false;
	}
	if (searches.desk === 0 && searches.mobile === 0) {
		if (enableDetailedLogs) {
			log(`[${functionName}] - No searches to perform.`, "update");
		}
		return false;
	}
	try {
		const rsaTab = await app.tabs.create({
			url: bing,
			active: true,
		});
		tabId = Number(rsaTab.id);
		await wait(tabId);
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Created new tab with ID: ${tabId} and URL: ${bing}`,
				"update",
			);
		}
		await app.tabs.update(tabId, {
			autoDiscardable: false,
		});
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Updated tab ID: ${tabId} to be non-discardable.`,
				"update",
			);
		}
		config.runtime.rsaTab = Number(tabId);
		watchTabs(tabId);
		config.runtime.total = searches.desk + searches.mob;
		config.runtime.done = 0;
		config.runtime.running = 1;
		await set(config);
		await attach(tabId);
		await app.alarms.clear("schedule");
		if (enableDetailedLogs) {
			log(`[${functionName}] - Cleared schedule alarm.`, "update");
		}
		await app.action.setBadgeText({ text: "0%" });
		await app.action.setBadgeTextColor({ color: "#FFFFFF" });
		await app.action.setBadgeBackgroundColor({ color: "#0072FF" });
		if (enableDetailedLogs) {
			log(`[${functionName}] - Set badge text to 0%.`, "update");
		}
		if (searches.desk > 0 && config?.runtime?.running) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Starting desktop searches: ${searches.desk}`,
					"update",
				);
			}
			const didSearchSucceed = await search(
				searches.desk,
				searches.min,
				searches.max,
			);
			if (!didSearchSucceed) {
				log(
					enableDetailedLogs
						? `[${functionName}] - Desktop search failed.`
						: `[initialize] - Desktop search failed.`,
					enableDetailedLogs ? "error" : undefined,
				);
			} else {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Desktop search succeeded.`,
						"success",
					);
				}
			}
		} else {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - No desktop searches to perform.`,
					"update",
				);
			}
		}
		if (searches.mob > 0 && config?.runtime?.running) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Starting mobile searches: ${searches.mob}`,
					"update",
				);
			}
			config.runtime.mobile = 1;
			await set(config);
			if (enableDetailedLogs) {
				log(`[${functionName}] - Set mobile flag to 1.`, "update");
			}
			const didSimulateSucceed = await simulate(tabId);
			if (!didSimulateSucceed) {
				log(
					enableDetailedLogs
						? `[${functionName}] - Mobile simulation failed.`
						: `[initialize] - Mobile simulation failed.`,
					enableDetailedLogs ? "error" : undefined,
				);
			} else {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Mobile simulation succeeded.`,
						"success",
					);
				}
			}
			const didSearchSucceed = await search(
				searches.mob,
				searches.min,
				searches.max,
			);
			if (!didSearchSucceed) {
				log(
					enableDetailedLogs
						? `[${functionName}] - Mobile search failed.`
						: `[initialize] - Mobile search failed.`,
					enableDetailedLogs ? "error" : undefined,
				);
			} else {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Mobile search succeeded.`,
						"success",
					);
				}
			}
		} else {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - No mobile searches to perform.`,
					"update",
				);
			}
		}
		if (config?.control?.clear) {
			await clear();
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Cleared bing browsing data after searches.`,
					"update",
				);
			}
		}
		if (enableDetailedLogs) {
			log(`[${functionName}] - Finished all searches.`, "success");
		} else {
			log(`[initialize] - Finished all searches.`);
		}
		await detach(tabId);

		if (
			config?.control?.act &&
			config?.pro?.key &&
			config?.runtime?.running
		) {
			if (enableDetailedLogs) {
				log(`[${functionName}] - Starting activity.`, "update");
			}
			const isActivitySuccessful = await activity(tabId);
			if (!isActivitySuccessful) {
				log(
					enableDetailedLogs
						? `[${functionName}] - Activity failed.`
						: `[initialize] - Activity failed.`,
					enableDetailedLogs ? "error" : undefined,
				);
				return false;
			} else {
				if (enableDetailedLogs) {
					log(`[${functionName}] - Finished activity.`, "success");
				} else {
					log(`[initialize] - Finished activity.`);
				}
			}
		}
		return true;
	} catch (error) {
		log(
			enableDetailedLogs
				? `[${functionName}] - Error occurred: ${error.message}`
				: `[initialize] - Error occurred.`,
			enableDetailedLogs ? "error" : undefined,
		);
		return false;
	} finally {
		await app.action.setBadgeText({ text: "" });
		try {
			const tabs = await app.tabs.query({});
			if (tabs.length < 2) {
				await app.tabs.create({});
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Created new tab to avoid closing the browser window.`,
						"update",
					);
				}
			}
			await app.tabs.remove(tabId);
			if (enableDetailedLogs) {
				log(`[${functionName}] - Closed tab ID: ${tabId}.`, "update");
			}
		} catch (error) {
			log(
				enableDetailedLogs
					? `[${functionName}] - Error occurred: ${error.message}`
					: `[initialize] - Error occurred.`,
				enableDetailedLogs ? "error" : undefined,
			);
		}
		await resetRuntime();
		if (!config?.pro?.key) {
			await app.tabs.create({
				url: "https://getprojects.gumroad.com/l/rsa",
				active: true,
			});
		} else {
			const modes = {
				m3: { min: 300, range: 150 },
				m4: { min: 900, range: 150 },
			};
			const mode = modes[config.schedule.mode];
			if (mode) {
				const randomDelay =
					Math.floor(Math.random() * mode.range) + mode.min;
				const alarmTime = Date.now() + randomDelay * 1000;
				await app.alarms.create("schedule", { when: alarmTime });
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Created schedule alarm for ${randomDelay} seconds.`,
						"update",
					);
				} else {
					log(`[initialize] - Created schedule alarm.`);
				}
			}
		}
	}
}

app.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === "schedule") {
		config = await get();
		enableDetailedLogs = config?.control?.log;
		const functionName = "ALARM";
		if (enableDetailedLogs) {
			log(`[${functionName}] - Alarm triggered.`, "update");
		} else {
			log(`[alarm] - Alarm triggered.`);
		}
		if (
			config?.control?.consent &&
			config?.pro?.key &&
			!["m1", "m2"].includes(config.schedule.mode) &&
			(config.schedule.desk !== 0 || config.schedule.mob !== 0)
		) {
			try {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - Starting scheduled searches.`,
						"update",
					);
				} else {
					log(`[alarm] - Starting scheduled searches.`);
				}
				await initialize(config.schedule);
			} catch (error) {
				log(
					enableDetailedLogs
						? `[${functionName}] - Error occurred: ${error.message}`
						: `[alarm] - Error occurred.`,
					enableDetailedLogs ? "error" : undefined,
				);
			}
		}
	}
});

app.runtime.onInstalled.addListener(async (details) => {
	if (details.reason === "install") {
		log(
			"[install] - Extension installed. Opening Terms and Conditions and setting user geo.",
			"update",
		);
		await app.tabs.create({
			url: tnc,
		});
		await setUserGeo();
	}
	if (details.reason === "update") {
		log(
			"[update] - Extension updated. Opening Terms and Conditions and handling storage.",
			"update",
		);
		await app.tabs.create({
			url: tnc,
		});
		try {
			const { pro } = await app.storage.sync.get("pro");
			if (pro) {
				config.pro.key = pro.key;
				config.pro.seats = pro.seats;
			}
			await app.storage.local.clear();
			await app.storage.sync.clear();
			await setUserGeo();
		} catch (error) {
			log(
				`[update] - Error occurred while handling storage: ${error.message}`,
				"error",
			);
			await app.runtime.reload();
		}
	}
});

app.runtime.onStartup.addListener(async () => {
	try {
		config = await get();
		enableDetailedLogs = config?.control?.log;
		const functionName = "STARTUP";
		if (enableDetailedLogs) {
			log(`[${functionName}] - Extension started.`, "update");
		} else {
			log(`[startup] - Extension started.`);
		}
		if (config?.control?.consent && config?.pro?.key) {
			await reverify();
		} else {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Consent not given or Pro key not found.`,
					"update",
				);
			} else {
				log(`[startup] - Consent not given or Pro key not found.`);
			}
		}
		if (
			config?.control?.consent &&
			config?.pro?.key &&
			!["m1"].includes(config.schedule.mode) &&
			(config.schedule.desk !== 0 || config.schedule.mob !== 0)
		) {
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Starting scheduled searches.`,
					"update",
				);
			} else {
				log(`[startup] - Starting scheduled searches.`);
			}
			await initialize(config.schedule);
		}
	} catch (error) {
		log(`[startup] - Error occurred: ${error.message}`, "error");
	}
});

app.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	config = await get();
	enableDetailedLogs = config?.control?.log;
	const functionName = "MESSAGE";
	if (enableDetailedLogs) {
		log(
			`[${functionName}] - Message received: ${message.action}`,
			"update",
		);
	} else {
		log(`[message] - Message received.`);
	}
	if (!config?.control?.consent) {
		if (enableDetailedLogs) {
			log(
				`[${functionName}] - Consent not given. Ignoring message.`,
				"update",
			);
		} else {
			log(`[message] - Consent not given. Ignoring message.`);
		}
		return false;
	}
	switch (message.action) {
		case "start":
			if (config.search.desk === 0 && config.search.mob === 0) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - No searches to perform.`,
						"update",
					);
				} else {
					log(`[message] - No searches to perform.`);
				}
				sendResponse({
					success: false,
					message: "No searches to perform.",
				});
				return false;
			}
			sendResponse({ success: true, message: "Starting searches." });
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Starting searches: ${config.search.desk} desktop and ${config.search.mob} mobile.`,
					"update",
				);
			} else {
				log(`[message] - Starting searches.`);
			}
			await initialize(config.search);
			break;		case "schedule":
			if (config?.schedule?.desk === 0 && config?.schedule?.mob === 0) {
				if (enableDetailedLogs) {
					log(
						`[${functionName}] - No searches to perform.`,
						"update",
					);
				} else {
					log(`[message] - No searches to perform.`);
				}
				sendResponse({
					success: false,
					message: "No searches to perform.",
				});
				return false;
			}
			sendResponse({
				success: true,
				message: "Starting scheduled searches.",
			});
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Starting scheduled searches: ${config.schedule.desk} desktop and ${config.schedule.mob} mobile.`,
					"update",
				);
			} else {
				log(`[message] - Starting scheduled searches.`);
			}
			await initialize(config.schedule);
			break;
		case "stop":
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Stopping searches or activities.`,
					"update",
				);
			} else {
				log(`[message] - Stopping searches or activities.`);
			}
			config.runtime.running = 0;
			await set(config);
			sendResponse({
				success: true,
				message: "Stopping searches or activities.",
			});
			break;		case "clear":
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Clearing bing browsing data.`,
					"update",
				);
			} else {
				log(`[message] - Clearing browsing data.`);
			}
			await clear();
			sendResponse({
				success: true,
				message: "Clearing bing browsing data.",
			});
			break;		case "simulate":
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Toggling mobile device simulation.`,
					"update",
				);
			} else {
				log(`[message] - Toggling mobile device simulation.`);
			}
			sendResponse({
				success: true,
				message: "Toggling mobile device simulation.",
			});
			await toggleSimulate();
			break;		case "activity":
			if (enableDetailedLogs) {
				log(`[${functionName}] - Starting activity.`, "update");
			} else {
				log(`[message] - Starting activity.`);
			}
			sendResponse({ success: true, message: "Starting activity." });
			const activityTab = await app.tabs.create({
				url: rewards,
				active: true,
			});
			await wait(activityTab.id);
			config.runtime.running = 1;
			config.runtime.act = 1;
			await set(config);
			await activity(activityTab.id);
			await app.tabs.remove(activityTab.id);
			await resetRuntime();
			break;
		default:
			if (enableDetailedLogs) {
				log(
					`[${functionName}] - Unknown message action: ${message.action}`,
					"error",
				);
			} else {
				log(`[message] - Unknown message action.`);
			}
			sendResponse({
				success: false,
				message: "Unknown message action.",
			});
			break;
	}
	return true;
});
