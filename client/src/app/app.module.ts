import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { BoardsModule } from './boards/boards.module';
import { BoardModule } from './board/board.module';
import { AuthInterceptor } from './auth/services/authinterceptor.service';
import { SocketService } from './shared/services/socket.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule, 
    HomeModule,
    BoardsModule,
    BoardModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true, 
    }, 
    SocketService, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
