import { OBASAssistantSettings } from "../types";
import { DEFAULT_SETTINGS } from "./default-settings";

export class SettingsManager {
	private settings: OBASAssistantSettings;

	constructor(
		private loadData: () => Promise<any>,
		private saveData: (data: any) => Promise<void>
	) {
		this.settings = Object.assign({}, DEFAULT_SETTINGS);
	}

	async load() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		return this.settings;
	}

	async save() {
		await this.saveData(this.settings);
	}

	get() {
		return this.settings;
	}

	update(settings: Partial<OBASAssistantSettings>) {
		this.settings = { ...this.settings, ...settings };
	}
}
