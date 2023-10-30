import { Injectable } from "@angular/core";
import { CodeEditorActions } from "@core/store/code-editor/code-edior.action";
import { Actions, ofType } from "@ngrx/effects";
import { Subject } from "rxjs";




@Injectable()
export class TerminalBufferService {

    private _buffer: string[] = []

    messages$ = new Subject<string>();

    constructor(
        private actions$: Actions
    ) {

        this.actions$.pipe(
            ofType(CodeEditorActions.WebsocketStreamMessage)
        ).subscribe((action) => {
            this._buffer.push(action.msg);
            this.messages$.next(action.msg);
        });
    }

    get buffer() {
        return this._buffer
    }

    clear() {
        this._buffer = [];
    }
}