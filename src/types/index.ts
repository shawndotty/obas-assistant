// 扩展 App 类型以包含 commands 属性
declare module "obsidian" {
	interface App {
		commands: {
			executeCommandById(id: string): void;
		};
		plugins: {
			plugins: {
				[key: string]: any;
			};
		};
		dom: {
			appContainerEl: HTMLElement;
		};
	}
}

export interface AirtableIds {
	baseID: string;
	tableID: string;
	viewID: string;
}

export interface OBASAssistantSettings {
	updateAPIKey: string;
	updateAPIKeyIsValid: boolean;
	obasFrameworkFolder: string;
	userEmail: string;
	userChecked: boolean;
	newSlideLocationOption: string;
	assignedNewSlideLocation: string;
	defaultDesign: string;
	templatesFolder: string;
	userSlideTemplate: string;
	userChapterTemplate: string;
	userChapterAndPagesTemplate: string;
	userPageTemplate: string;
	userBaseLayoutTemplate: string;
	userTocTemplate: string;
	presenter: string;
	tagline: string;
	slogan: string;
	dateFormat: string;
	enableUserTemplates: boolean;
	customizeSlideFolderName: boolean;
	addChapterWithSubPages: boolean;
	demoFolder: string;
	updateIDs: {
		style: AirtableIds;
		templates: AirtableIds;
		demo: AirtableIds;
		reveal: AirtableIds;
	};
	obasHue: number;
	obasSaturation: number;
	obasLightness: number;
}

export interface NocoDBTable {
	viewID: string;
	baseID?: string;
	tableID?: string;
	targetFolderPath: string;
}

export interface NocoDBSettings {
	apiKey: string;
	tables: NocoDBTable[];
	iotoUpdate?: boolean;
	syncSettings?: {
		recordFieldsNames?: {
			title?: string;
			content?: string;
			subFolder?: string;
			extension?: string;
		};
	};
}

export interface RecordFields {
	[key: string]: any;
	Title?: string;
	MD?: string;
	SubFolder?: string;
	Extension?: string;
}

export interface Record {
	fields: RecordFields;
}

// 设置项配置接口
export interface SettingConfig {
	name: string;
	desc: string;
	placeholder?: string;
	value: any;
	onChange: (value: any) => Promise<void>;
}

export interface ReplaceConfig {
	baseLayout?: string;
	toc?: string;
	design?: string;
	obasPath?: string;
	tagline?: string;
	slogan?: string;
	presenter?: string;
	presentDate?: string;
	cIndex?: string;
	pIndex?: string;
	cName?: string;
	slideName?: string;
}
