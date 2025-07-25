import { App, Plugin } from "obsidian";
import { ApiService } from "./api-services";
import { CommandService } from "./command-service";
import { TemplaterService } from "./templater-service";
import { CssService } from "./css-services";
import { OBASAssistantSettings } from "../types";

export function createServices(
	plugin: Plugin,
	app: App,
	settings: OBASAssistantSettings
) {
	const templaterService = new TemplaterService(app);
	const apiService = new ApiService(settings);
	const cssService = new CssService(app, settings);
	const commandService = new CommandService(
		plugin.addCommand.bind(plugin),
		app,
		settings,
		templaterService
	);

	return {
		templaterService,
		apiService,
		commandService,
		cssService,
	};
}
