const app = chrome || browser;

function log(message, type = "default") {
	const colorMap = {
		default: "#555555",
		success: "#48d17e",
		warning: "#f0a500",
		error: "#ff0000",
		update: "#00aaff",
	};

	const color = colorMap[type] || colorMap.default;

	const time = new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	console.log(
		`%c[${time}] - [${type.toUpperCase()}] - ${message}`,
		`color: ${color}; font-weight: bold;`,
	);
}

async function set(value) {
	const enableDetailedLogs = value?.control?.log;
	return new Promise((resolve, reject) => {
		app.storage.local.set({ config: value }, () => {
			if (app.runtime.lastError) {
				const errorMessage = `Failed to set config data: ${app.runtime.lastError.message}`;
				log(errorMessage, "error");
				return reject(new Error(errorMessage));
			}
			if (enableDetailedLogs) {
				log("Config data successfully set.", "success");
				log(JSON.stringify(value), "update");
			} else {
				log("Config data successfully set.", "success");
			}
			resolve();
		});
	});
}

async function get() {
	try {
		const result = await new Promise((resolve, reject) => {
			app.storage.local.get("config", (items) => {
				if (app.runtime.lastError) {
					const errorMessage = `Failed to get config data: ${app.runtime.lastError.message}`;
					log(errorMessage, "error");
					return reject(new Error(errorMessage));
				}
				const retrievedValue = items.config || null;
				const enableDetailedLogs = retrievedValue?.control?.log;
				if (enableDetailedLogs) {
					log("Config data successfully retrieved.", "success");
					log(
						`Retrieved storage value: ${JSON.stringify(
							retrievedValue,
						)}`,
						"update",
					);
				} else {
					log("Config data successfully retrieved.", "success");
				}
				resolve(retrievedValue);
			});
		});
		return result;
	} catch (error) {
		log(`Error retrieving config data: ${error.message}`, "error");
		throw error;
	}
}

export { log, set, get };
