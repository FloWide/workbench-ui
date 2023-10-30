import { Injectable } from "@angular/core";
import { AppState, Select } from "@core/store";
import { CodeEditorActions } from "@core/store/code-editor/code-edior.action";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, Subject, Subscription } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { CustomHttpService } from "../http/custom-http.service";
import { RepositoryFileEntry, WebSocketEditMessage, WebsocketMessage,WebscoketResponse, WebSocketEditResponseMessage } from "./repo.model";




@Injectable({
    providedIn:'root'
})
export class RepositoryEditService {
    

    private token: string = '';

    private editWebsocketSubject$ : WebSocketSubject<WebsocketMessage | WebscoketResponse> = null;
    private webSocketSubscription : Subscription = null;

    constructor(
        private http: CustomHttpService,
        private store: Store<AppState>,
        private actions$: Actions
    ) {
        this.store.select(Select.accessToken).subscribe((token) => this.token = token);

        this.actions$.pipe(
            ofType(CodeEditorActions.ConnectToEditWebsocket)
        ).subscribe((action) => {
            this.setupEditWebsocket(action.repo,action.force);
        });

        this.actions$.pipe(
            ofType(CodeEditorActions.SendEditMessage)
        ).subscribe(action => {
            if (this.editWebsocketSubject$) {
                this.editWebsocketSubject$.next({
                    type:'edit',
                    data:action.msg
                });
            }
        });
        this.actions$.pipe(
            ofType(CodeEditorActions.SendControlMessage)
        ).subscribe((action) => {
            if (this.editWebsocketSubject$)
                this.editWebsocketSubject$.next({
                    type:'control',
                    data:action.msg
                })
        });

        this.actions$.pipe(
            ofType(CodeEditorActions.SendStreamMessage)
        ).subscribe((action) => {
            if (this.editWebsocketSubject$) {
                this.editWebsocketSubject$.next({
                    type:'stream',
                    data:action.msg
                })
            }
        });
        
        this.actions$.pipe(
            ofType(CodeEditorActions.DisconnectFromEditWebsocket)
        ).subscribe(() => {
            this.disconnectWebsocket();
        })
    }

    getFileTree(id: number) : Observable<RepositoryFileEntry[]> {
        return this.http.get(`/repo/${id}/edit/filetree`)
    }

    getFileContent(id: number,filePath: string): Observable<string> {
        return this.http.get(`/repo/${id}/edit/file/${encodeURIComponent(filePath)}`,{
            responseType:'text'
        })
    }

    getLspUrl(id: number) : string {
        return `${this.http.websocketUrl}/repo/${id}/edit/lsp?token=${this.token}`
    }

    downloadFile(id:number,path: string) {
        const download = `${this.http.API.api}/repo/${id}/edit/file/${encodeURIComponent(path)}?token=${this.token}`
        window.open(download,'Download')
    }

    private setupEditWebsocket(id:number,force:boolean = false) {

        this.disconnectWebsocket();
        const openObserver = new Subject();
        this.editWebsocketSubject$ = webSocket({
            url:`${this.http.websocketUrl}/repo/${id}/edit/ws?token=${this.token}&force=${force}`,
            openObserver:openObserver
        });

        openObserver.subscribe(() => this.store.dispatch(CodeEditorActions.ConnectToEditWebsocketSuccess()));

        this.webSocketSubscription = this.editWebsocketSubject$.subscribe({
            next:this.webSocketMsgHandler.bind(this),
            error:this.webSocketClosedHandler.bind(this),
            complete:this.webSocketClosedHandler.bind(this)
        });
    }

    private disconnectWebsocket() {

        if(this.editWebsocketSubject$) {
            this.editWebsocketSubject$.complete();
            this.editWebsocketSubject$ = null;
        }

        if(this.webSocketSubscription) {
            this.webSocketSubscription.unsubscribe();
            this.webSocketSubscription = null;
        }
    }

    private webSocketMsgHandler(msg:WebsocketMessage) {
        if (msg.type === 'edit')
            this.store.dispatch(CodeEditorActions.WebSocketEditResponse({msg:(msg.data as any)}));
        else if (msg.type === 'control')
            this.store.dispatch(CodeEditorActions.WebSocketControlResponse({msg:msg.data as any}));
        else if (msg.type === 'stream')
            this.store.dispatch(CodeEditorActions.WebsocketStreamMessage({msg:msg.data as any}));
    }

    private webSocketClosedHandler() {
        this.store.dispatch(CodeEditorActions.ConnectToEditWebsocketError());
    }


}