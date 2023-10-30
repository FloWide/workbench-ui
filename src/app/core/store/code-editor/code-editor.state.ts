import { Action, createReducer, on } from "@ngrx/store";
import { CodeEditorActions } from "./code-edior.action";
import { GitStatus, RepositoryFileEntry, RepositoryModel, WebsocketControlResponseMessage } from "@core/services/repo/repo.model";



export type CodeTab = RepositoryFileEntry & {modified:boolean};

export interface CodeTabs {
    [key:string]:CodeTab
}

export type RunnerState = WebsocketControlResponseMessage

export interface CodeEditorState {
    files:RepositoryFileEntry[];
    repo:RepositoryModel;
    git_status:GitStatus;
    openTabs:CodeTabs;
    focusedTab:CodeTab;
    editWebsocketConnected:boolean;
    unsavedChanges:boolean;
    runnerState: RunnerState;
}

const initalState: CodeEditorState = {
    repo:null,
    files:null,
    git_status:null,
    openTabs:{},
    focusedTab:null,
    editWebsocketConnected:false,
    unsavedChanges:false,
    runnerState:null
}


const reducer = createReducer(
    initalState,
    on(CodeEditorActions.SetRepo,(state,{repo}) => {
        return {
            ...state,
            repo:repo,
        }
    }),
    on(CodeEditorActions.CloseTab,(state,{tab}) => {
        if (!(tab.path in state.openTabs))
            return state;

        let openTabs = {...state.openTabs}
        delete openTabs[tab.path];

        if(state.focusedTab === tab)
            return {...state,openTabs:openTabs,focusedTab:Object.values(openTabs)[0]}

        return {...state,openTabs:openTabs};
    }),
    on(CodeEditorActions.OpenTab,(state,{tab}) => {
        return {
            ...state,
            openTabs:{...state.openTabs,[tab.path]:tab}
        }
    }),
    on(CodeEditorActions.FocusTab,(state,{tab}) => {
        return {
            ...state,
            focusedTab:tab
        }
    }),
    on(CodeEditorActions.ConnectToEditWebsocketSuccess,(state,action) => {
        return {
            ...state,
            editWebsocketConnected:true
        }
    }),
    on(CodeEditorActions.ConnectToEditWebsocketError,(state,action) => {
        return {
            ...state,
            editWebsocketConnected:false
        }
    }),
    on(CodeEditorActions.WebSocketEditResponse,(state,{msg}) => {
        return {
            ...state,
            files:msg.files,
            git_status:msg.git_status
        }
    }),
    on(CodeEditorActions.SetTabModified,(state,{tab}) => {

        const openTabs = {...state.openTabs}

        openTabs[tab.path] = tab;

        let focusedtab = state.focusedTab
        if(tab === state.focusedTab)
            focusedtab = tab
        let unsavedChanges = false;
        for(const k in openTabs) {
            if(openTabs[k].modified) {
                unsavedChanges = true;
                break;
            }
        }
            
        return {
            ...state,
            openTabs:openTabs,
            unsavedChanges:unsavedChanges,
            focusedTab:focusedtab
        }
    }),
    on(CodeEditorActions.Clear,(state) => {
        return initalState;
    }),
    on(CodeEditorActions.SetFiles,(state,{files}) => {
        return {
            ...state,
            files:files
        }
    }),
    on(CodeEditorActions.SetGitStatus,(state,{status}) => {
        return {
            ...state,
            git_status:status
        }
    }),
    on(CodeEditorActions.WebSocketControlResponse,(state,{msg}) => {
        return {
            ...state,
            runnerState:{
                ...state.runnerState,
                ...msg
            }
        }
    })
)

export function codeEditorReducer(state:CodeEditorState,action:Action) {
    return reducer(state,action);
}