import { Injectable } from "@angular/core";
import { BehaviorSubject, map, filter, Observable, throwError  } from "rxjs";
import { catchError } from 'rxjs/operators';    
import { HttpClient } from "@angular/common/http";

import { CurrentUserInterface } from "../types/currentUser.interface"; 
import { RegisterRequestInterface } from "../types/registerRequest.interface";
import { LoginRequestInterface } from "../types/loginRequest.interface";
import { environment } from "src/environments/environment";

@Injectable() 

export class AuthService {
    currentUser$= new BehaviorSubject<CurrentUserInterface | null | undefined>(
        undefined
    ) 

    isLogged$ = this.currentUser$.pipe(
        filter((currentUser) => currentUser !== undefined), 
        map(Boolean)
    ); 

    constructor(private http: HttpClient) {}; 
    
    getCurrentUser(): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/user'; 
        return this.http.get<CurrentUserInterface>(url);
    }

    register(
        registerRequest: RegisterRequestInterface
    ): Observable<CurrentUserInterface> { 
        const url = environment.apiUrl + '/users';
        return this.http.post<CurrentUserInterface>(url, registerRequest);
    }

    login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/users/login';
        return this.http.post<CurrentUserInterface>(url, loginRequest); 
    }

    setToken(currentUser: CurrentUserInterface): void { 
        localStorage.setItem('token', currentUser.token);
    }

    setCurrentUser(currentUser: CurrentUserInterface | null): void {
        this.currentUser$.next(currentUser);
    }
}