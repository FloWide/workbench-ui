import { AppConfig } from "../repo/repo.model";

export type ScriptState = 'active' | 'starting' | 'inactive';


export interface ScriptModel {
    version: string;
    state: ScriptState;
    port?: number;
    exit_code?: number;
    name: string;
    config: AppConfig;
    type: 'python' | 'streamlit';
    created_at: number;
    compound_id:[string,string];
    owner_name: string;
    repository_id: number;

}

export interface Scripts {
    [k:string]: {
        [k:string]:ScriptModel
    };
}

export function isScriptModel(obj: any): obj is ScriptModel {
    if (obj === null || obj === undefined) return false;

    if (Array.isArray(obj)) return false;

    return 'type' in obj && (obj.type === 'python' || obj.type === 'streamlit')
}