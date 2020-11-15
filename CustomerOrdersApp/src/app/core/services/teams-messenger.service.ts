import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CustomerChangeType } from 'src/app/shared/enums';
import { IApiResponse, ICustomer } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class TeamsMessengerService {

    apiUrl = 'https://learntogetherbot.ngrok.io/api/notify';

    constructor(private http: HttpClient) { }

    notifyCustomerChanged(changeType: CustomerChangeType, customerId: number): Observable<IApiResponse> {
        const change = {
            changeType: CustomerChangeType[changeType],
            customerId
        };
        console.log(change);
        return this.http.post<IApiResponse>(this.apiUrl, change)
            .pipe(
                map(res => {
                    console.log('notifyCustomerChanged called: ', change);
                    return res;
                }),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(errMessage);
            // Use the following instead if using lite-server
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(error || 'Node.js server error');
    }
}