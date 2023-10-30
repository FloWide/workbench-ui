import { GitStatus, RepositoryFileEntry, RepositoryModel, WebsocketContolMessage, WebsocketControlResponseMessage, WebSocketEditMessage, WebSocketEditResponseMessage } from "@core/services/repo/repo.model";
import { createAction, props } from "@ngrx/store";
import { create } from "lodash";
import { CodeTab } from "./code-editor.state";

export namespace CodeEditorActions {



    export const SetRepo = createAction('[CODE EDITOR] Set repo',props<{repo:RepositoryModel}>());

    export const SetFiles = createAction('[CODE EDITOR] Set Files',props<{files:RepositoryFileEntry[]}>());

    export const SetGitStatus = createAction('[CODE EDITOR] Set Git status',props<{status:GitStatus}>());

    export const OpenTab = createAction('[CODE EDITOR] Open tab',props<{tab:CodeTab}>());

    export const CloseTab = createAction('[CODE EDITOR] Close tab',props<{tab:CodeTab}>());

    export const FocusTab = createAction('[CODE EDITOR] Focus tab',props<{tab:CodeTab}>());

    export const SetTabModified =  createAction('[CODE EDITOR] Set tab modified',props<{tab:CodeTab}>());

    export const NewTextModel = createAction('[CODE EDITOR] New Text model',props<{path:string,model:monaco.editor.ITextModel}>());

    export const GetFileContent = createAction('[CODE EDITOR] Get file content',props<{path:string,repo:number,}>());

    export const GetFileContentSuccess = createAction('[CODE EDITOR] Get file content success',props<{repo:number,path:string,content:string}>());

    export const GetFileContentError = createAction('[CODE EDITOR] Get file content error',props<{repo:number,path:string}>());

    export const ConnectToEditWebsocket = createAction('[CODE EDITOR] Connect to edit websocket',props<{repo:number,force?:boolean}>());

    export const DisconnectFromEditWebsocket = createAction('[CODE EDITOR] Disconnect from edit websocket');

    export const ConnectToEditWebsocketSuccess = createAction('[CODE EDITOR] Connect to edit websocket success');

    export const ConnectToEditWebsocketError = createAction('[CODE EDITOR] Connect to edit websocket error');

    export const SendEditMessage = createAction('[CODE EDITOR] Send edit message',props<{msg:WebSocketEditMessage}>());

    export const SendControlMessage = createAction('[CODE EDITOR] Send control message',props<{msg:WebsocketContolMessage}>());

    export const SendStreamMessage = createAction('[CODE EDITOR] Send Stream message',props<{msg:string}>());

    export const WebSocketEditResponse = createAction('[CODE EDITOR] Websocket edit response',props<{msg:WebSocketEditResponseMessage}>());

    export const WebSocketControlResponse = createAction('[CODE EDITOR] Websocket control response',props<{msg:WebsocketControlResponseMessage}>());

    export const WebsocketStreamMessage = createAction('[CODE EDITOR] Websocket stream message',props<{msg:string}>());

    export const CommitChanges = createAction('[CODE EDITOR] Commit changes',props<{repo:number,commitMsg:string}>());

    export const CommitChangesSuccess = createAction('[CODE EDITOR] Commit changes success',props<{repo:number}>());

    export const CommitChangesError = createAction('[CODE EDITOR] Commit changes error',props<{repo:number}>());

    export const Clear = createAction('[CODE EDITOR] Clear');


}