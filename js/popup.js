import { log, set, get } from "/js/utils.js";

const app = chrome || browser;
const ext_id = "eanofdhdfbcalhflpbdipkjjkoimeeod";
const gumroad_api = "https://api.gumroad.com/v2/licenses";
const product_id = "D-1vxIJJlbq1sZUhTpz70A==";
const pro = "https://getprojects.gumroad.com/l/rsa";
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
let showAds = false;

const $search = $("#search");
const $schedule = $("#schedule");
const $settings = $("#settings");

const $nav = $(".nav");

const $searchSec = $("section.search");
const $scheduleSec = $("section.schedule");
const $settingsSec = $("section.settings");

const $searchDesk = $("#searchDesk");
const $searchMob = $("#searchMob");
const $searchMin = $("#searchMin");
const $searchMax = $("#searchMax");

const $searchDefault = $("#searchDefault");
const $searchDefaultChildren = $searchDefault.children("a");

const $searchPerform = $("#searchPerform");

const $scheduleDesk = $("#scheduleDesk");
const $scheduleMob = $("#scheduleMob");
const $scheduleMin = $("#scheduleMin");
const $scheduleMax = $("#scheduleMax");

const $scheduleDefault = $("#scheduleDefault");
const $scheduleDefaultChildren = $scheduleDefault.children("a");

const $schedulePerform = $("#schedulePerform");

const $requireConsent = $(".consent");
const $requirePro = $(".pro");

const $deviceName = $("#deviceName");
const $resetDevice = $("#resetDevice");

const $clear = $("#clear");

const $logs = $("#logs");

const $pro = $("#pro");

const $niche = $("#niche");

const $autoAct = $("#autoAct");

const $activity = $("#activity");

const $clearBing = $("#clearBing");

const $simulate = $("#simulate");

const $resetRuntime = $("#resetRuntime");

const $resetConfig = $("#resetConfig");

const $history = $("#history");

const $deleteHistory = $("#deleteHistory");

const $consent = $("#consent");
const $consentForm = $("#consentForm");
const $accept = $("#accept");

const $progress = $(".progress:not(.act)");
const $ad_banner_slider = $("#ad-banner-slider");
const $promo = $(".promo");
const $rating = $(".rating");
const $ratingSpan = $(".rating span");
const $footer = $("footer");

// Reset Pro membership function
async function resetPro() {
	const logs = config?.control?.log;
	try {
		config.pro.key = "";
		config.pro.seats = 0;
		config.control.niche = "random";
		config.control.act = 0;
		config.schedule.mode = "m1";
		logs && log("[RESET] - Pro membership reset successfully", "success");
		await set(config);
	} catch (error) {
		log(
			`[RESET] - Error resetting Pro membership: ${error?.message}`,
			"error",
		);
	}
}

// Reset runtime data function
async function resetRuntime() {
	const logs = config?.control?.log;
	try {
		config.runtime.done = 0;
		config.runtime.total = 0;
		config.runtime.running = 0;
		config.runtime.rsaTab = null;
		config.runtime.mobile = 0;
		config.runtime.act = 0;
		logs && log("[RESET] - Runtime data reset successfully", "success");
		await set(config);
	} catch (error) {
		log(
			`[RESET] - Error resetting runtime data: ${error?.message}`,
			"error",
		);
	}
}

// Gumroad membership reverification function
async function verify(key) {
	// Premium features unlocked - always return true
	const logs = config?.control?.log;
	logs && log("[VERIFY] - Premium User auto-verified successfully.", "success");
	config.pro.key = "PREMIUM_UNLOCKED";
	config.pro.seats = 999;
	await set(config);
	return true;
}

function compare() {
	const desk = Number($searchDesk.val());
	const mob = Number($searchMob.val());
	const logs = config?.control?.log;

	$searchDefaultChildren.removeClass("active");

	const matchMap = {
		g1: { desk: 10, mob: 0 },
		g2: { desk: 20, mob: 10 },
		g3: { desk: 30, mob: 20 },
		g4: { desk: 50, mob: 30 },
	};

	for (const [id, val] of Object.entries(matchMap)) {
		if (desk === val.desk && mob === val.mob) {
			$searchDefault.find(`#${id}`).addClass("active");
			break;
		}
	}
	logs &&
		log(
			`[COMPARE] - Search values compared and marked: ${$searchDefault
				.find(".active")
				.attr("id")} `,
			"update",
		);
}

async function setupDevice() {
	const logs = config?.control?.log;
	return new Promise(async (resolve) => {
		try {
			const randomDevice =
				devices[Math.floor(Math.random() * devices.length)];
			logs &&
				log(`[SETUP] - Setting up device: ${randomDevice}`, "update");
			config.device.name = randomDevice.name;
			config.device.ua = randomDevice.userAgent;
			config.device.h = randomDevice.height;
			config.device.w = randomDevice.width;
			config.device.scale = randomDevice.deviceScaleFactor;
			await set(config);
			return resolve();
		} catch (error) {
			logs &&
				log(
					`[SETUP] - Error setting up device: ${error?.message}`,
					"error",
				);
			return resolve(await setupDevice());
		}
	});
}

async function updateUI() {
	const storedConfig = await get();
	if (storedConfig) {
		Object.assign(config, storedConfig);
	}
	const logs = config?.control?.log;
	$searchDesk.val(config.search.desk);
	$searchMob.val(config.search.mob);
	$searchMin.val(config.search.min);
	$searchMax.val(config.search.max);
	compare();

	$scheduleDesk.val(config.schedule.desk);
	$scheduleMob.val(config.schedule.mob);
	$scheduleMin.val(config.schedule.min);
	$scheduleMax.val(config.schedule.max);
	$scheduleDefaultChildren.each((i, el) => {
		$(el).removeClass("active");
	});
	$scheduleDefault.find(`a#${config.schedule.mode}`).addClass("active");

	if (config.device.name) {
		$deviceName.text(config.device.name);
	} else {
		await setupDevice();
		$deviceName.text(config.device.name);
	}

	if (config.runtime.running) {
		$searchPerform.text("Stop");
		$schedulePerform.text("Stop");
	} else {
		$searchPerform.text("Search");
		$schedulePerform.text("Schedule");
	}

	if (config.control.consent) {
		$consentForm.hide();
		$requireConsent.removeClass("no-consent");
		if (config.control.clear) {
			$clear.prop("checked", true);
		} else {
			$clear.prop("checked", false);
		}
		if (config.control.log) {
			$logs.prop("checked", true);
		} else {
			$logs.prop("checked", false);
		}
		$progress.width(
			(config.runtime.done / config.runtime.total) * 100 + "%",
		);
	} else {
		$consentForm.show();
		$requireConsent.addClass("no-consent");
	}
	// Force premium features to be always active
	$requirePro.removeClass("no-pro");
	$schedulePerform.removeClass("no-pro");
	$pro.val("PREMIUM_UNLOCKED");
	$niche.val(config.control.niche || "random");
	$ad_banner_slider.hide(); // Always hide ads

	if (config.control.act) {
		$autoAct.prop("checked", true);
	} else {
		$autoAct.prop("checked", false);
	}

	// Always hide promo and rating (premium user)
	$promo.hide();
	$rating.hide();
	$footer.hide();

	if (config.runtime.act) {
		$("#activity ~ .progressBar > .progress").addClass("running");
	} else {
		$("#activity ~ .progressBar > .progress").removeClass("running");
	}
	logs && log(`[UPDATE] - UI updated`, "update");
}

function handleNavigation() {
	const logs = config?.control?.log;
	$search.on("click", () => {
		$nav.removeClass("active");
		$search.addClass("active");
		$searchSec.show();
		$scheduleSec.hide();
		$settingsSec.hide();
		logs && log(`[UI] Search section opened`, "update");
	});

	$schedule.on("click", () => {
		$nav.removeClass("active");
		$schedule.addClass("active");
		$searchSec.hide();
		$scheduleSec.show();
		$settingsSec.hide();
		logs && log(`[UI] Schedule section opened`, "update");
	});

	$settings.on("click", () => {
		$nav.removeClass("active");
		$settings.addClass("active");
		$searchSec.hide();
		$scheduleSec.hide();
		$settingsSec.show();
		logs && log(`[UI] Settings section opened`, "update");
	});

	$search.click();
}

$(document).ready(async () => {
	const width = screen.width;
	const scale = width / 1920;
	const logs = config?.control?.log;
	$("body").css("--scale", `${scale}`);	await updateUI();
	handleNavigation();
	
	// Always hide ads for premium users
	$ad_banner_slider.hide();
	showAds = false;

	$accept.on("click", async () => {
		if (config.control.consent) {
			$consentForm.hide();
			return;
		}
		config.control.consent = 1;
		await set(config);
		await updateUI();
	});

	// Search section events handling
	$searchDesk.on("input change", async function () {
		const min = Number($(this).attr("min"));
		const max = Number($(this).attr("max"));
		let val = Number($(this).val());
		if (isNaN(val)) {
			val = config.search.desk;
		} else {
			val = Math.max(min, Math.min(max, val)); // Clamp within min/max
		}
		$(this).val(val);
		config.search.desk = val;
		await set(config);
		logs && log(`[SEARCH] - Search desk value changed: ${val}`, "update");
		compare();
	});

	$searchMob.on("input change", async function () {
		const min = Number($(this).attr("min"));
		const max = Number($(this).attr("max"));
		let val = Number($(this).val());
		if (isNaN(val)) {
			val = config.search.mob;
		} else {
			val = Math.max(min, Math.min(max, val)); // Clamp within min/max
		}
		$(this).val(val);
		config.search.mob = val;
		await set(config);
		logs && log(`[SEARCH] - Search mobile value changed: ${val}`, "update");
		compare();
	});

	$searchMin.on("input change", async function () {
		const minAttr = Number($(this).attr("min"));
		const maxAttr = Number($(this).attr("max"));
		let min = Number($(this).val());
		if (isNaN(min) || min < minAttr) {
			min = config.search.min;
		} else {
			min = Math.max(minAttr, Math.min(maxAttr, min));
		}
		// Ensure at least 1.5x gap
		let max = Number($searchMax.val());
		if (max < min * 1.5) {
			max = Math.ceil(min * 1.5);
			$searchMax.val(max);
			config.search.max = max;
		}
		$(this).val(min);
		config.search.min = min;
		await set(config);
		logs && log(`[SEARCH] - Search min value changed: ${min}`, "update");
	});

	$searchMax.on("input change", async function () {
		const minAttr = Number($(this).attr("min"));
		const maxAttr = Number($(this).attr("max"));
		let max = Number($(this).val());
		if (isNaN(max) || max < minAttr) {
			max = config.search.max;
		} else {
			max = Math.max(minAttr, Math.min(maxAttr, max));
		}
		// Ensure at least 1.5x gap
		let min = Number($searchMin.val());
		if (max < min * 1.5) {
			min = Math.floor(max / 1.5);
			$searchMin.val(min);
			config.search.min = min;
		}
		$(this).val(max);
		config.search.max = max;
		await set(config);
		logs && log(`[SEARCH] - Search max value changed: ${max}`, "update");
	});

	// search modes
	$searchDefaultChildren.on("click", async function () {
		const mode = $(this).attr("id");
		$searchDefaultChildren.removeClass("active");
		$(this).addClass("active");
		config.search.mode = mode;
		if (mode === "g1") {
			config.search.desk = 10;
			config.search.mob = 0;
		}
		if (mode === "g2") {
			config.search.desk = 20;
			config.search.mob = 10;
		}
		if (mode === "g3") {
			config.search.desk = 30;
			config.search.mob = 20;
		}
		if (mode === "g4") {
			config.search.desk = 50;
			config.search.mob = 30;
		}
		$searchDesk.val(config.search.desk);
		$searchMob.val(config.search.mob);
		await set(config);
		logs &&
			log(
				`[SEARCH] - Search mode changed: ${mode} (desk: ${config.search.desk}, mob: ${config.search.mob})`,
				"update",
			);
	});

	// searchPerform
	$searchPerform.on("click", async function () {
		if (!config.control.consent) {
			$consentForm.show();
			logs && log(`[SEARCH] - Consent required to start search`, "error");
			return;
		}
		if (config.runtime.running) {
			const res = await app.runtime.sendMessage({
				action: "stop",
			});
			logs && log(`[SEARCH] - Search stopped`, "update");
		} else {
			const res = await app.runtime.sendMessage({
				action: "start",
			});
			logs && log(`[SEARCH] - Search started`, "update");
		}
	});

	$scheduleDesk.on("input change", async function () {
		const min = Number($(this).attr("min"));
		const max = Number($(this).attr("max"));
		let val = Number($(this).val());
		if (isNaN(val)) {
			val = config.schedule.desk;
		} else {
			val = Math.max(min, Math.min(max, val)); // Clamp within min/max
		}
		$(this).val(val);
		config.schedule.desk = val;
		await set(config);
		logs &&
			log(`[SCHEDULE] - Schedule desk value changed: ${val}`, "update");
	});

	$scheduleMob.on("input change", async function () {
		const min = Number($(this).attr("min"));
		const max = Number($(this).attr("max"));
		let val = Number($(this).val());
		if (isNaN(val)) {
			val = config.schedule.mob;
		} else {
			val = Math.max(min, Math.min(max, val)); // Clamp within min/max
		}
		$(this).val(val);
		config.schedule.mob = val;
		await set(config);
		logs &&
			log(`[SCHEDULE] - Schedule mobile value changed: ${val}`, "update");
	});

	$scheduleMin.on("input change", async function () {
		const minAttr = Number($(this).attr("min"));
		const maxAttr = Number($(this).attr("max"));
		let min = Number($(this).val());
		if (isNaN(min) || min < minAttr) {
			min = config.schedule.min;
		} else {
			min = Math.max(minAttr, Math.min(maxAttr, min));
		}
		// Ensure at least 1.5x gap
		let max = Number($scheduleMax.val());
		if (max < min * 1.5) {
			max = Math.ceil(min * 1.5);
			$scheduleMax.val(max);
			config.schedule.max = max;
		}
		$(this).val(min);
		config.schedule.min = min;
		await set(config);
		logs &&
			log(`[SCHEDULE] - Schedule min value changed: ${min}`, "update");
	});

	$scheduleMax.on("input change", async function () {
		const minAttr = Number($(this).attr("min"));
		const maxAttr = Number($(this).attr("max"));
		let max = Number($(this).val());
		if (isNaN(max) || max < minAttr) {
			max = config.schedule.max;
		} else {
			max = Math.max(minAttr, Math.min(maxAttr, max));
		}
		// Ensure at least 1.5x gap
		let min = Number($scheduleMin.val());
		if (max < min * 1.5) {
			min = Math.floor(max / 1.5);
			$scheduleMin.val(min);
			config.schedule.min = min;
		}
		$(this).val(max);
		config.schedule.max = max;
		await set(config);
		logs &&
			log(`[SCHEDULE] - Schedule max value changed: ${max}`, "update");
	});

	// schedule modes
	$scheduleDefaultChildren.on("click", async function () {
		if (!config.pro.key) {
			app.tabs.create({
				url: pro,
			});
			logs &&
				log(
					`[SCHEDULE] - Pro membership required to change schedule mode`,
					"error",
				);
			return;
		}
		const mode = $(this).attr("id");
		$scheduleDefaultChildren.removeClass("active");
		$(this).addClass("active");
		config.schedule.mode = mode;
		if (mode === "m1") {
			config.schedule.desk = 0;
			config.schedule.mob = 0;
			await app.alarms.clear("schedule");
		}
		if (mode === "m2") {
			config.schedule.desk = config.search.desk;
			config.schedule.mob = config.search.mob;
			await app.alarms.clear("schedule");
		}
		if (mode === "m3") {
			config.schedule.desk = 2;
			config.schedule.mob = 2;
			const randomDelay = Math.floor(Math.random() * 150) + 300;
			const alarmTime = Date.now() + randomDelay * 1000;
			await app.alarms.create("schedule", {
				when: alarmTime,
			});
		}
		if (mode === "m4") {
			config.schedule.desk = 5;
			config.schedule.mob = 5;
			const randomDelay = Math.floor(Math.random() * 150) + 900;
			const alarmTime = Date.now() + randomDelay * 1000;
			await app.alarms.create("schedule", {
				when: alarmTime,
			});
		}
		$scheduleDesk.val(config.schedule.desk);
		$scheduleMob.val(config.schedule.mob);
		await set(config);
		logs &&
			log(
				`[SCHEDULE] - Schedule mode changed: ${mode} (desk: ${config.schedule.desk}, mob: ${config.schedule.mob})`,
				"update",
			);
	});

	// schedulePerform
	$schedulePerform.on("click", async function () {
		if (!config.control.consent) {
			$consentForm.show();
			logs &&
				log(`[SCHEDULE] - Consent required to start schedule`, "error");
			return;
		}
		if (!config.pro.key) {
			await app.tabs.create({
				url: pro,
			});
			logs &&
				log(
					`[SCHEDULE] - Pro membership required to start schedule`,
					"error",
				);
			return;
		}
		if (config.runtime.running) {
			const res = await app.runtime.sendMessage({
				action: "stop",
			});
			logs && log(`[SCHEDULE] - Schedule stopped`, "update");
		} else {
			if (
				config.schedule.mode !== "m1" &&
				config.schedule.mode !== "m2"
			) {
				const res = await app.runtime.sendMessage({
					action: "schedule",
				});
				logs && log(`[SCHEDULE] - Schedule saved`, "update");
			}
		}
	});

	$resetDevice.on("click", async () => {
		await setupDevice();
	});

	$clear.on("change", async function () {
		config.control.clear = $(this).is(":checked") ? 1 : 0;
		await set(config);
		logs && log(`[SETTINGS] - Set: clear ${config.control.clear}`);
	});

	$logs.on("change", async function () {
		config.control.log = $(this).is(":checked") ? 1 : 0;
		await set(config);
		logs && log(`[SETTINGS] - Set: logs ${config.control.log}`);
	});

	$pro.on("change", async (event) => {
		const key = $pro.val().trim();
		if (key.length === 35 || (event.key === "Enter" && key.length > 0)) {
			logs &&
				log(
					`[SETTINGS] - Pro key entered: ${key} - Verifying...`,
					"update",
				);
			await verify(key);
		} else {
			resetPro();
			logs && log(`[SETTINGS] - Pro key reset`, "update");
		}
	});

	$niche.on("change", async function () {
		if (!config.pro.key) {
			return;
		}
		const val = $(this).val().trim();
		config.control.niche = val;
		await set(config);
		logs && log(`[SETTINGS] - Niche changed: ${val}`, "update");
	});

	$autoAct.on("change", async function () {
		if (!config.pro.key) {
			return;
		}
		config.control.act = $(this).is(":checked") ? 1 : 0;
		await set(config);
		logs &&
			log(`[SETTINGS] - Set: autoAct ${config.control.act}`, "update");
	});

	$activity.on("click", async function () {
		if (!config.pro.key) {
			return;
		}
		const $btnText = $(this).text();
		await app.runtime.sendMessage({
			action: "activity",
		});
		logs && log(`[SETTINGS] - Activity button clicked`, "update");
		await flashSuccess($(this), $btnText);
	});

	$clearBing.on("click", async () => {
		if (!config.pro.key) {
			return;
		}
		const $btnText = $clearBing.text();
		await app.runtime.sendMessage({
			action: "clear",
		});
		logs && log(`[SETTINGS] - Clear button clicked`, "update");
		await flashSuccess($clearBing, $btnText);
	});

	$simulate.on("click", async () => {
		if (!config.pro.key) {
			return;
		}
		await app.runtime.sendMessage({
			action: "simulate",
		});
		logs && log(`[SETTINGS] - Simulate button clicked`, "update");
	});

	$resetRuntime.on("click", async () => {
		if (!config.pro.key) {
			return;
		}
		const $btnText = $resetRuntime.text();
		await resetRuntime();
		logs && log(`[SETTINGS] - Reset runtime button clicked`, "update");
		await flashSuccess($resetRuntime, $btnText);
	});

	$resetConfig.on("click", async () => {
		if (!config.pro.key) {
			return;
		}
		const $btnText = $resetConfig.text();
		await flashSuccess($resetConfig, $btnText);
		logs && log(`[SETTINGS] - Reset config button clicked`, "update");
		await app.storage.local.remove("config", () => {
			if (app.runtime.lastError) {
				console.error(
					"Error removing config from storage:",
					app.runtime.lastError,
				);
			} else {
				console.debug("[storage] Config removed");
				location.reload();
			}
		});
	});

	$consent.on("click", async () => {
		$accept.text("Agreed - Use Extension!");
		$consentForm.show();
		logs &&
			log(`[SETTINGS] - Consent button clicked and form shown`, "update");
	});

	$history.on("click", async function () {
		if (!config.pro.key) {
			return;
		}
		const $btn = $(this);
		const originalText = $btn.text();
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		const results = await new Promise((resolve) => {
			app.history.search(
				{
					text: "bing.com/search",
					startTime: oneDayAgo,
					maxResults: 1000,
				},
				resolve,
			);
		});
		const filtered = results.filter((item) =>
			/^https:\/\/(www\.)?bing\.com\/search/i.test(item.url),
		);
		const blob = new Blob([JSON.stringify(filtered, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "bing-search-history[Rewards Search Automator].json";
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		logs &&
			log(
				`[HISTORY] - Downloaded search history: ${filtered.length} items`,
				"update",
			);
		await flashSuccess($btn, originalText);
	});

	$deleteHistory.on("click", async function () {
		if (!config.pro.key) {
			return;
		}
		const $btn = $(this);
		const originalText = $btn.text();
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		const results = await new Promise((resolve) => {
			app.history.search(
				{
					text: "bing.com/search",
					startTime: oneDayAgo,
					maxResults: 1000,
				},
				resolve,
			);
		});
		const filtered = results.filter((item) =>
			/^https:\/\/(www\.)?bing\.com\/search/i.test(item.url),
		);
		for (const item of filtered) {
			await new Promise((res) =>
				app.history.deleteUrl({ url: item.url }, res),
			);
		}
		logs &&
			log(
				`[HISTORY] - Deleted search history: ${filtered.length} items`,
				"update",
			);
		await flashSuccess($btn, originalText);
	});

	$ratingSpan.on("click", function () {
		const $this = $(this);
		const index = $this.index();
		if (index > 3) {
			chrome.windows.create({
				url: "https://chromewebstore.google.com/detail/rewards-search-automator/eanofdhdfbcalhflpbdipkjjkoimeeod/reviews",
				type: "popup",
				width: screen.width * 0.7,
				height: screen.height * 0.7,
				top: 100,
				left: 100,
			});
		} else {
			chrome.windows.create({
				url: "https://chromewebstore.google.com/detail/eanofdhdfbcalhflpbdipkjjkoimeeod/support",
				type: "popup",
				width: screen.width * 0.7,
				height: screen.height * 0.7,
				top: 100,
				left: 100,
			});
		}
	});
});

async function flashSuccess($btn, originalText) {
	$btn.css("background", "#0072FF").text("Success!");
	await new Promise((r) => setTimeout(r, 1000));
	$btn.css("background", "").text(originalText);
}

app.storage.onChanged.addListener((changes, area) => {
	if (area === "local" && changes.config) {
		updateUI();
	}
});
