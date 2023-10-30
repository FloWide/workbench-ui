

export interface RuntimeConfig {
    entry_file: string;
    env: {
        [k:string]:string
    };
    cli_args: Array<string | number>
}


export enum AppType {
    STREAMLIT = 'streamlit',
    SERVICE = 'service',
    PYTHON = 'python'
}

export interface AppConfig {
    app_icon: string;
    type: AppType;
    config: RuntimeConfig;
}

export interface AppsConfigJson {
    apps: {
        [key:string]: AppConfig
    }
    metadata: any;
}

export interface RepositoryModel {
    git_service_id: number;
    http_url: string;
    name: string;
    default_branch: string;
    owner_id: number;
    owner_name: string;
    root_path: string;
    forked_from_id: number;
    apps_config:AppsConfigJson;
}

export interface RepositoryCreationModel {
    name: string;
    template?: AppType;
}

export interface RepositoryFileEntry {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: RepositoryFileEntry[];
}

export interface RepositoryForkModel {
    new_name?: string;
    to_user_id: number;
}

export interface RepositoryUpdateRequestModel {
    auto_merge?: boolean;
    force_update?: boolean;
    leave_merge_conflict?: boolean;
}

export interface Repositories {
    [key:number]: RepositoryModel
}

export enum GitAnalyzeResults {
    UP_TO_DATE = 'Up to date',
    FAST_FORWARD = 'Fast Forward',
    MERGE_REQUIRED = 'Merge Required',
    MERGE_CONFLICT = 'Merge Conflict',
    MERGE_CONFLICT_LOCAL_HARD_RESET = "Merge conflict local hard reset",
    MERGE_CONFLICT_REMOTE_HARD_RESET = "Merge conflict remote hard reset",
    AUTO_MERGE = 'Auto merge',
    NO_ACTION = 'No action',
}

export interface GitStatus {
    [k:string]: number;
}

export interface GitState {
    head:string;
    tags: string[];
    branches: string[];
    status:GitStatus;
    stash_length:number;
}

export interface GitBranchCreateModel {
    name: string;
}

export interface GitTagCreateModel {
    name: string;
    message?: string;
    auto_push?: boolean
}

export interface GitCommitModel {
    message: string;
    auto_add_file?:boolean;
    auto_push?:boolean;
}

export enum GitStatusFlags {
    GIT_STATUS_CURRENT = 0,
    GIT_STATUS_INDEX_NEW = 1,
    GIT_STATUS_INDEX_MODIFIED = 2,
    GIT_STATUS_INDEX_DELETED = 4,
    GIT_STATUS_INDEX_RENAMED = 8,
    GIT_STATUS_INDEX_TYPECHANGE = 16,
    GIT_STATUS_WT_NEW = 128,
    GIT_STATUS_WT_MODIFIED = 256,
    GIT_STATUS_WT_DELETED = 512,
    GIT_STATUS_WT_TYPECHANGE = 1024,
    GIT_STATUS_WT_RENAMED = 2048,
    GIT_STATUS_WT_UNREADABLE = 4096,
    GIT_STATUS_IGNORED = 16384,
    GIT_STATUS_CONFLICTED = 32768
}

export type EditAction = 'create' | 'delete' | 'move' | 'update';

export type ControlAction = 'run' | 'stop'

export interface WebsocketContolMessage {
    action: ControlAction;
    type?: 'python' | 'streamlit'
    file: string
    env?: {[key:string]:string}
    cli_args?: any[];
}

export interface WebSocketEditMessage {
    action:EditAction;
    file_path:string;
    previous_path:string;
    content:string;
    base64encoded:boolean;
}

export interface WebSocketEditResponseMessage {
    files:RepositoryFileEntry[];
    git_status:GitStatus;
}

export interface WebsocketMessage {
    type: 'edit' | 'control' | 'stream';
    data: WebSocketEditMessage | WebsocketContolMessage | string;
}

export interface WebsocketControlResponseMessage {
    status?: 'active' | 'inactive';
    port?: number;
    exit_code?: number;
    type: 'python' | 'streamlit';

}

export interface WebscoketResponse {
    type: 'edit' | 'control' | 'stream'
    data: string | WebSocketEditResponseMessage
}

export function isRepositoryModel(obj: any): obj is RepositoryModel {
    if (obj === null || obj === undefined) return false

    if (Array.isArray(obj)) return false

    return 'git_service_id' in obj && 'http_url' in obj && 'name' in obj;
}