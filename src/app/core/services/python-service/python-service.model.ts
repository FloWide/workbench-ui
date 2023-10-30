import { AppConfig } from "../repo/repo.model";

export type PythonServiceState = 'active' | 'starting' | 'inactive' | 'failed to start'

export interface PythonServiceModel {
    version: string;
    state: PythonServiceState;
    exit_code?: number;
    config: AppConfig;
    name: string;
    started_at: number;
    created_at: number;
    compound_id:[string,string];
    owner_name: string;
    enabled: boolean;
    repository_id: number;
}

export interface PythonServices {
    [key:string]:{
        [k:string]:PythonServiceModel
    }
}