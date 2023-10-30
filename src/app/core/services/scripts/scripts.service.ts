import { Injectable } from '@angular/core';
import { CustomHttpService } from '../http/custom-http.service';
import { Observable} from 'rxjs';
import { ScriptModel, Scripts } from './scripts.model';
import { Params } from '@angular/router';
import { AppState, Select } from '@core/store';
import { Store } from '@ngrx/store';
import { environment } from '@env/environment';
import { map } from 'rxjs/operators';
import { Logger } from 'src/app/utils/logger';
import { RuntimeConfig } from '../repo/repo.model';


@Injectable({
    providedIn:'root'
})
export class ScriptsService {

    private token: string = '';

    constructor(
        private http:CustomHttpService,
        private store: Store<AppState>
    ) {
        this.store.select(Select.accessToken).subscribe((token) => this.token = token);
    }

    getScripts() : Observable<Scripts> {
        return this.http.get('/script')
    }

    getScript(compound_id: [string,string]) : Observable<ScriptModel> {
        return this.http.get(`/script/${compound_id[0]}/${compound_id[1]}`)
    }

    stopScript(compound_id: [string,string]): Observable<ScriptModel> {
        return this.http.post(`/script/${compound_id[0]}/${compound_id[1]}/stop`)
    }

    killScript(compound_id: [string,string]): Observable<ScriptModel> {
        return this.http.post(`/script/${compound_id[0]}/${compound_id[1]}/kill`)
    }

    runScript(compound_id: [string,string],overrides?: Partial<RuntimeConfig>): Observable<ScriptModel> {
        return this.http.post(`/script/${compound_id[0]}/${compound_id[1]}/run`,overrides)
    }

    getIframeUrl(port: number,queryParams?:Params): string {
        const queryString = this.paramsToQueryString({...queryParams,token:this.token});
        if (!environment.production)
            return `http://localhost:${port}/?${queryString}`
        return `${this.http.API.streamlit_apps}/${port}/?${queryString}`
    }

    getOutputWebsocketUrl(compound_id: [string,string]) : string {
        return `${this.http.websocketUrl}/script/${compound_id[0]}/${compound_id[1]}/output?token=${this.token}`
    }

    logo(compound_id: [string,string],cache_id: string = ''): string {
        return `${this.http.API.api}/script/${compound_id[0]}/${compound_id[1]}/logo?token=${this.token}&cache_id=${cache_id}`
    }

    private paramsToQueryString(params: Params): string {
        const str = [];
        for(const p in params) {
          str.push(
            `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`
          )
        }
        return str.join('&');
      }

}