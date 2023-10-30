import { Inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, takeUntil,take } from "rxjs/operators";
import { MONACO_LOADED } from "src/app/monaco-editor/monaco-editor.module";

import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, MessageTransports } from 'monaco-languageclient';
import { AppState, Select } from "@core/store";
import { Store } from "@ngrx/store";
import { RepositoryModel } from "@core/services/repo/repo.model";
import { RepositoryEditService } from "@core/services/repo/repo-edit.service";
import * as monaco from 'monaco-editor';
import { CustomHttpService } from "@core/services";

import * as monacoyaml from 'monaco-yaml'

@Injectable()
export class CodeEditorLspService implements OnDestroy {

    private destroy$ = new Subject();

    private editingRepo: RepositoryModel = null;

    private websocket: WebSocket = null;

    constructor(
        @Inject(MONACO_LOADED) private monacoLoaded$: BehaviorSubject<boolean>,
        private store: Store<AppState>,
        private editSerivce: RepositoryEditService,
        private http: CustomHttpService
    ) {
        this.monacoLoaded$.pipe(
            takeUntil(this.destroy$),
            filter((v) => v),
            take(1)
        ).subscribe(() => {
            MonacoServices.install(monaco as any);
            this.setupSchemaValidation();
        });

        this.store.select(Select.editingRepo).pipe(
            takeUntil(this.destroy$),
            filter((repo) => repo?.git_service_id !== this.editingRepo?.git_service_id)
        ).subscribe((repo) => {
            this.editingRepo = repo;
            const url = this.editSerivce.getLspUrl(repo.git_service_id);
            if (this.websocket) {
                this.websocket.close()
            }
            this.websocket = new WebSocket(url);
            this.websocket.onopen = () => {
                const socket = toSocket(this.websocket);
                const reader = new WebSocketMessageReader(socket);
                const writer = new WebSocketMessageWriter(socket);
                const languageClient = this.createLanguageClient({
                    reader,
                    writer
                });
                languageClient.start();
                reader.onClose(() => languageClient.stop());
            }
        })
    }

    private createLanguageClient (transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: `${this.editingRepo.name} Lsp client`,
            clientOptions: {
                // use a language id as a document selector
                documentSelector: ['python'],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports);
                }
            }
        });
    }
    
    private setupSchemaValidation() {
        monacoyaml.setDiagnosticsOptions(
            {
              enableSchemaRequest: true,
              hover: true,
              completion: true,
              validate: true,
              format: true,
              schemas:[
                  {
                    // Id of the first schema
                    uri: `${this.http.API.api}/public/schemas/appconfig.schema`,
                    // Associate with our model
                    fileMatch: [String('appconfig.yml')]
                  },
              ]
            }
          )
          
    }


    ngOnDestroy(): void {
        this.websocket?.close();
        this.destroy$.next();
        this.destroy$.complete();
    }


}