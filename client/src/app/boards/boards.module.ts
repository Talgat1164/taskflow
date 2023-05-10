import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth/services/authGuard.service';
import { InlineFormModule } from '../shared/modules/inlineForm/inlineForm.module';
import { TopbarModule } from '../shared/modules/topbar/topbar.module';
import { BoardsService } from '../shared/services/boards.service';
import { BoardsComponent } from './components/boards/boards.component';
import { FormsModule } from '@angular/forms'; // Добавьте этот импорт

import { LoaderModule } from '../shared/modules/loader/loader.module'; // Добавьте этот импорт
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: 'boards',
    component: BoardsComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  declarations: [BoardsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InlineFormModule,
    TopbarModule,
    FormsModule,
    LoaderModule, 
    TranslateModule,
  ],
  providers: [BoardsService],
})
export class BoardsModule {}