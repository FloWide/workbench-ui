import { AppState, ScriptModel } from "..";


export namespace Select {


    export const repos = (state: AppState) => state.repos.repos;
    export const repoById = (state: AppState,id: number) => state.repos.repos ? state.repos.repos[id] : null;

    export const scripts = (state:AppState) => state.scripts.scripts;
    export const scriptByCompoundId = (state: AppState,id: [string,string]): ScriptModel => {
        if (!state.scripts.scripts) 
            return null;

        const by_repos = state.scripts.scripts[id[0]]
        if (!by_repos)
            return null;
        if (id[1] === 'latest')
            return scriptsByNameLatest(state,id[0])
        return by_repos[id[1]]
    }

    export const scriptsByNameLatest = (state: AppState,name: string): ScriptModel => {
        if (!state.scripts.scripts)
            return null

        const by_version = state.scripts.scripts[name]
        if (!by_version)
            return null

        return Object.values(by_version).sort((a,b) => b.created_at - a.created_at)[0]
    }

    export const services = (state: AppState) => state.services.services;
    export const serviceById = (state:AppState,id: number) => state.services.services ? state.services.services[id] : null

    export const users = (state: AppState) => state.user.users;
    export const me = (state:AppState) => state.user.me;

    export const connectors = (state:AppState) => state.backend.dcmConnectors;
    export const selectedDcmConnection = (state:AppState) => state.backend.selectedDcmConnector;
    export const apiUrl = (state:AppState) => state.backend.backend;
    
    export const user = (state:AppState) => state.user.userProfile;
    export const accessToken = (state:AppState) => state.user.accessToken;

    export const editingRepo = (state:AppState) => state.codeEditor.repo;
    export const repofiles = (state:AppState) => state.codeEditor.files;
    export const openCodeTabs = (state:AppState) => state.codeEditor.openTabs;
    export const focusedCodeTab = (state:AppState) => state.codeEditor.focusedTab;
    export const gitStatus = (state:AppState) => state.codeEditor.git_status;
    export const editWebsocketState = (state:AppState) => state.codeEditor.editWebsocketConnected;
    export const codeEditorUnsavedChanges = (state:AppState) => state.codeEditor.unsavedChanges;

    export const runnerState = (state: AppState) => state.codeEditor.runnerState;

}

//     export const projectByName = (state:AppState,name:string) => state.scripts.projects ? state.scripts.projects[name] : null;
