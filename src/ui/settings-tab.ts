import { App, debounce, PluginSettingTab, Setting } from "obsidian";
import { t } from "../lang/helpers";
import OBASAssistant from "../main";
import { isValidApiKey, isValidEmail } from "../utils";
import { ApiService } from "../services/api-services";
import { FolderSuggest } from "./pickers/folder-picker";
import { FileSuggest, FileSuggestMode } from "./pickers/file-picker";
import { SettingConfig } from "src/types";
import { TabbedSettings } from "./tabbed-settings";

type SettingsKeys = keyof OBASAssistant["settings"];

export class OBASAssistantSettingTab extends PluginSettingTab {
	plugin: OBASAssistant;
	private apiService: ApiService;

	constructor(app: App, plugin: OBASAssistant) {
		super(app, plugin);
		this.plugin = plugin;
		this.apiService = new ApiService(this.plugin.settings);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", {
			text: t("OBAS_Assistant_Settings_Heading"),
		});

		const tabbedSettings = new TabbedSettings(containerEl);

		// 定义标签页配置
		const tabConfigs = [
			{
				title: "Main Setting",
				renderMethod: (content: HTMLElement) =>
					this.renderMainSettings(content),
			},
			{
				title: "User Templates Setting",
				renderMethod: (content: HTMLElement) =>
					this.renderUserSettings(content),
			},
			{
				title: "Theme Setting",
				renderMethod: (content: HTMLElement) =>
					this.renderThemeSettings(content),
			},
			{
				title: "Slide Settings",
				renderMethod: (content: HTMLElement) =>
					this.renderSlideSettings(content),
			},
		];

		// 使用循环创建标签页
		tabConfigs.forEach((config) => {
			tabbedSettings.addTab(t(config.title as any), config.renderMethod);
		});
	}

	private renderMainSettings(containerEl: HTMLElement): void {
		this.createValidatedInput({
			containerEl,
			name: t("OBAS Update API Key"),
			description: t("Please enter a valid update API Key"),
			placeholder: t("Enter the API Key"),
			getValue: () => this.plugin.settings.updateAPIKey,
			setValue: (value) => (this.plugin.settings.updateAPIKey = value),
			getIsValid: () => this.plugin.settings.updateAPIKeyIsValid,
			setIsValid: (isValid) =>
				(this.plugin.settings.updateAPIKeyIsValid = isValid),
			localValidator: isValidApiKey,
			remoteValidator: () => this.apiService.checkApiKey(),
		});

		this.createValidatedInput({
			containerEl,
			name: t("Your Email Address"),
			description: t(
				"Please enter the email you provided when you purchase this product"
			),
			placeholder: t("Enter your email"),
			getValue: () => this.plugin.settings.userEmail,
			setValue: (value) => (this.plugin.settings.userEmail = value),
			getIsValid: () => this.plugin.settings.userChecked,
			setIsValid: (isValid) =>
				(this.plugin.settings.userChecked = isValid),
			localValidator: isValidEmail,
			remoteValidator: () => this.apiService.getUpdateIDs(),
		});

		this.createFolderSetting(
			containerEl,
			"OBAS Framework Folder",
			"Please enter the path to the OBAS Framework Folder",
			"Enter the full path to the OBAS Framework folder",
			"obasFrameworkFolder"
		);

		this.createDropdownSetting(
			containerEl,
			"Default Design",
			"Please select your default design",
			"defaultDesign",
			{
				none: "None",
				a: "Slide Design A",
				b: "Slide Design B",
				c: "Slide Design C",
				d: "Slide Design D",
				e: "Slide Design E",
				f: "Slide Design F",
				g: "Slide Design G",
			}
		);

		const toggleDefaultLocation = (value: string) => {
			defaultLocationSetting.settingEl.style.display =
				value === "assigned" ? "" : "none";
		};

		this.createDropdownSetting(
			containerEl,
			"New Slide Location Option",
			"Please select the default new slide location option",
			"newSlideLocationOption",
			{
				current: "Current Folder",
				decideByUser: "Decide At Creation",
				assigned: "User Assigned Folder",
			},
			toggleDefaultLocation
		);

		const defaultLocationSetting = this.createFolderSetting(
			containerEl,
			"Default New Slide Location",
			"Please enter the path to the default new slide location",
			"Enter the full path to the default new slide location",
			"assignedNewSlideLocation"
		);

		toggleDefaultLocation(this.plugin.settings.newSlideLocationOption);

		this.createToggleSetting(containerEl, {
			name: "Customize Slide Folder Name",
			desc: "Use Customize Slide Folder Name",
			value: this.plugin.settings.customizeSlideFolderName,
			onChange: async (value) => {
				this.plugin.settings.customizeSlideFolderName = value;
				await this.plugin.saveSettings();
			},
		});

		this.createToggleSetting(containerEl, {
			name: "Add Sub Pages When Add Chapter",
			desc: "Add Sub Pages When Add Chapter",
			value: this.plugin.settings.addChapterWithSubPages,
			onChange: async (value) => {
				this.plugin.settings.addChapterWithSubPages = value;
				await this.plugin.saveSettings();
			},
		});
	}

	private renderUserSettings(containerEl: HTMLElement): void {
		this.createToggleSetting(containerEl, {
			name: "Enable User Templates",
			desc: "Enable User Templates",
			value: this.plugin.settings.enableUserTemplates,
			onChange: async (value) => {
				this.plugin.settings.enableUserTemplates = value;
				await this.plugin.saveSettings();
			},
		});

		this.createFolderSetting(
			containerEl,
			"User Templates Folder",
			"Please enter the path to your own templates",
			"Choose your templates folder",
			"templatesFolder"
		);

		this.createFileSetting(
			containerEl,
			"User Slide Template",
			"Please choose your personal slide template",
			"Choose your personal slide template",
			"userSlideTemplate"
		);

		this.createFileSetting(
			containerEl,
			"User Base Layout Template",
			"Please choose your personal base layout template",
			"Choose your personal base layout template",
			"userBaseLayoutTemplate"
		);

		this.createFileSetting(
			containerEl,
			"User TOC Template",
			"Please choose your personal TOC template",
			"Choose your personal TOC template",
			"userTocTemplate"
		);

		this.createFileSetting(
			containerEl,
			"User Chapter Template",
			"Please choose your personal chapter template",
			"Choose your personal chapter template",
			"userChapterTemplate"
		);

		this.createFileSetting(
			containerEl,
			"User Chapter With Sub Pages Template",
			"Please choose your personal chapter with sub pages template",
			"Choose your personal chapter with sub pages template",
			"userChapterAndPagesTemplate"
		);

		this.createFileSetting(
			containerEl,
			"User Page Template",
			"Please choose your personal page template",
			"Choose your personal page template",
			"userPageTemplate"
		);
	}

	private renderThemeSettings(containerEl: HTMLElement): void {
		const colorPreviewBlock = this.createColorPreview(containerEl);

		const setPreviewColor = () => {
			const { obasHue, obasSaturation, obasLightness } =
				this.plugin.settings;
			colorPreviewBlock.style.backgroundColor = `hsl(${obasHue}, ${obasSaturation}%, ${obasLightness}%)`;
		};

		setPreviewColor(); // Set initial color

		const onHslChange = debounce(
			async () => {
				await this.plugin.saveSettings();
				await this.plugin.services.cssService.modifyObasHslFile();
				setPreviewColor();
			},
			200,
			true
		);

		this.createSliderSetting(
			containerEl,
			"Hue",
			"Adjust the hue of the theme",
			"obasHue",
			360,
			onHslChange
		);

		this.createSliderSetting(
			containerEl,
			"Saturation",
			"Adjust the saturation of the theme",
			"obasSaturation",
			100,
			onHslChange
		);

		this.createSliderSetting(
			containerEl,
			"Lightness",
			"Adjust the lightness of the theme",
			"obasLightness",
			100,
			onHslChange
		);
	}

	private renderSlideSettings(containerEl: HTMLElement): void {
		this.createTextSetting(containerEl, {
			name: "Tagline",
			desc: "Set Tagline",
			placeholder: "Your Tagline",
			value: this.plugin.settings.tagline,
			onChange: async (value) => {
				this.plugin.settings.tagline = value;
				await this.plugin.saveSettings();
			},
		});

		this.createTextSetting(containerEl, {
			name: "Slogan",
			desc: "Set Slogan",
			placeholder: "Your Slogan",
			value: this.plugin.settings.slogan,
			onChange: async (value) => {
				this.plugin.settings.slogan = value;
				await this.plugin.saveSettings();
			},
		});

		this.createTextSetting(containerEl, {
			name: "Presenter",
			desc: "Set Presenter",
			placeholder: "Presenter",
			value: this.plugin.settings.presenter,
			onChange: async (value) => {
				this.plugin.settings.presenter = value;
				await this.plugin.saveSettings();
			},
		});

		this.createTextSetting(containerEl, {
			name: "Date Format",
			desc: "Set Date Format",
			placeholder: "Your Date Format",
			value: this.plugin.settings.dateFormat,
			onChange: async (value) => {
				this.plugin.settings.dateFormat = value;
				await this.plugin.saveSettings();
			},
		});
	}

	private createColorPreview(containerEl: HTMLElement): HTMLElement {
		const previewContainer = containerEl.createDiv({
			cls: "setting-item",
		});
		const settingItemInfo = previewContainer.createDiv({
			cls: "setting-item-info",
		});
		settingItemInfo.createDiv({
			text: t("Preview Your Slide Theme Color"),
			cls: "setting-item-name",
		});

		const settingItemControl = previewContainer.createDiv({
			cls: "setting-item-control",
		});
		const colorBlock = settingItemControl.createDiv({
			cls: "obas-color-preview-block",
		});
		return colorBlock;
	}

	private createSliderSetting(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		settingKey: "obasHue" | "obasSaturation" | "obasLightness",
		max: number,
		onChangeCallback: (value: number) => void
	) {
		new Setting(containerEl)
			.setName(t(name as any))
			.setDesc(t(desc as any))
			.addSlider((slider) =>
				slider
					.setLimits(0, max, 1)
					.setValue(this.plugin.settings[settingKey])
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings[settingKey] = value;
						onChangeCallback(value);
					})
			);
	}

	// 通用方法：创建切换设置项
	private createToggleSetting(
		content: HTMLElement,
		config: SettingConfig
	): void {
		new Setting(content)
			.setName(t(config.name as any))
			.setDesc(t(config.desc as any))
			.addToggle((toggle) => {
				toggle.setValue(config.value).onChange(config.onChange);
			});
	}

	private createTextSetting(
		content: HTMLElement,
		config: SettingConfig
	): void {
		new Setting(content)
			.setName(t(config.name as any))
			.setDesc(t(config.desc as any))
			.addText((text) => {
				text.setValue(config.value).onChange(config.onChange);
			});
	}

	private createBaseSetting(
		containerEl: HTMLElement,
		nameKey: string,
		descKey: string
	): Setting {
		return new Setting(containerEl)
			.setName(t(nameKey as any))
			.setDesc(t(descKey as any));
	}

	private createFolderSetting(
		containerEl: HTMLElement,
		nameKey: string,
		descKey: string,
		placeholderKey: string,
		settingKey: SettingsKeys
	): Setting {
		return this.createBaseSetting(containerEl, nameKey, descKey).addSearch(
			(text) => {
				new FolderSuggest(this.app, text.inputEl);
				text.setPlaceholder(t(placeholderKey as any))
					.setValue(this.plugin.settings[settingKey] as string)
					.onChange(async (value) => {
						(this.plugin.settings[settingKey] as any) = value;
						await this.plugin.saveSettings();
					});
			}
		);
	}

	private createFileSetting(
		containerEl: HTMLElement,
		nameKey: string,
		descKey: string,
		placeholderKey: string,
		settingKey: SettingsKeys
	) {
		this.createBaseSetting(containerEl, nameKey, descKey).addSearch(
			(text) => {
				new FileSuggest(
					text.inputEl,
					this.plugin,
					FileSuggestMode.TemplateFiles
				);
				text.setPlaceholder(t(placeholderKey as any))
					.setValue(this.plugin.settings[settingKey] as string)
					.onChange(async (value) => {
						(this.plugin.settings[settingKey] as any) = value;
						await this.plugin.saveSettings();
					});
			}
		);
	}

	private createDropdownSetting(
		containerEl: HTMLElement,
		nameKey: string,
		descKey: string,
		settingKey: SettingsKeys,
		options: Record<string, string>,
		onChangeCallback?: (value: string) => void
	): Setting {
		const translatedOptions = Object.entries(options).reduce(
			(acc, [key, valueKey]) => {
				acc[key] = t(valueKey as any);
				return acc;
			},
			{} as Record<string, string>
		);

		return this.createBaseSetting(
			containerEl,
			nameKey,
			descKey
		).addDropdown((dropdown) => {
			dropdown
				.addOptions(translatedOptions)
				.setValue(this.plugin.settings[settingKey] as string)
				.onChange(async (value) => {
					(this.plugin.settings[settingKey] as any) = value;
					await this.plugin.saveSettings();
					onChangeCallback?.(value);
				});
		});
	}

	private createValidatedInput(options: {
		containerEl: HTMLElement;
		name: string;
		description: string;
		placeholder: string;
		getValue: () => string;
		setValue: (value: string) => void;
		getIsValid: () => boolean;
		setIsValid: (isValid: boolean) => void;
		localValidator: (value: string) => boolean;
		remoteValidator: () => Promise<void>;
	}) {
		new Setting(options.containerEl)
			.setName(options.name)
			.setDesc(options.description)
			.addText((text) => {
				const controlEl = text.inputEl.parentElement;
				let statusEl: HTMLElement | null = null;

				const updateVisualState = (
					state: "valid" | "invalid" | "loading" | "idle"
				) => {
					// Clear previous state
					statusEl?.remove();
					text.inputEl.classList.remove(
						"valid-input",
						"invalid-input"
					);

					switch (state) {
						case "loading":
							statusEl = createEl("span", {
								text: t("Validating..."),
								cls: "setting-item-control-status loading-text",
							});
							controlEl?.prepend(statusEl);
							break;
						case "valid":
							statusEl = createEl("span", {
								text: t("Valid"),
								cls: "setting-item-control-status valid-text",
							});
							controlEl?.prepend(statusEl);
							text.inputEl.classList.add("valid-input");
							break;
						case "invalid":
							text.inputEl.classList.add("invalid-input");
							break;
						case "idle":
						default:
							break;
					}
				};

				const initialState = options.getIsValid() ? "valid" : "idle";
				updateVisualState(initialState);

				text.setPlaceholder(options.placeholder).setValue(
					options.getValue()
				);

				const debouncedValidation = debounce(
					async (value: string) => {
						options.setValue(value);
						await this.plugin.saveSettings();

						if (!options.localValidator(value)) {
							options.setIsValid(false);
							updateVisualState("invalid");
							return;
						}

						updateVisualState("loading");
						try {
							await options.remoteValidator();
							updateVisualState(
								options.getIsValid() ? "valid" : "invalid"
							);
						} catch (error) {
							console.error("Validation error:", error);
							updateVisualState("invalid");
						} finally {
							await this.plugin.saveSettings();
						}
					},
					500,
					true
				);

				text.onChange(debouncedValidation);
			});
	}
}
