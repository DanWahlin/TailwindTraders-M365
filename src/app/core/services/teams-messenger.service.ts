import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IApiResponse } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class TeamsMessengerService {

    constructor(private http: HttpClient) { }

    notifyCustomerUpdated(customerId: number): Observable<boolean> {
        const apiUrl = this.getApiUrl();
        return this.http
            .post<IApiResponse>(apiUrl, {
                customerId: customerId
            })
            .pipe(
                map(res => res.status),
                catchError(this.handleError)
            );
    }

    private getApiUrl() {
        return 'https://abc.ngrok.io/api/messages';
    }

    private handleError(error: HttpErrorResponse) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return Observable.throw(errMessage);
            // Use the following instead if using lite-server
            // return Observable.throw(err.text() || 'backend server error');
        }
        return Observable.throw(error || 'Node.js server error');
    }
}