import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class AccountService  {

    private observeServerStatus = new Subject<boolean>();
    public observeServerStatus$ = this.observeServerStatus.asObservable();
    constructor(private http: Http) { }

    get(): Observable<any> {
        return this.http.get('api/account').map((res: Response) => res.json());
    }

    save(account: any): Observable<Response> {
        return this.http.post('api/account', account);
    }

    sendImage(image: File): Observable<Response> {
        const formData = new FormData();
        formData.append('file', image);
        const headers = new Headers({});
        return this.http.post('api/account/image', formData, new RequestOptions({headers}));
    }

    getStatusServer(): Observable<boolean> {
        return this.http.get('api/status').map((res: Response) => {
            const status = res.json().status;
            this.observeServerStatus.next(status);
            return status;
        });
    }
}
