import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { ColumnInterface } from 'src/app/shared/types/column.interface';
import { ColumnInputInterface } from 'src/app/shared/types/columnInput.interface';
import { SocketEventsEnum } from 'src/app/shared/types/socketEvents.enum';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { TaskInputInterface } from 'src/app/shared/types/taskInput.interface';
import { SocketService } from 'src/app/shared/services/socket.service';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { BoardService } from '../services/board.service';
import { ColumnsService } from 'src/app/shared/services/columns.service';
import { TasksService } from 'src/app/shared/services/tasks.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {
  boardId: string;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;


  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private tasksService: TasksService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    data$: Observable<{
        board: BoardInterface;
        columns: ColumnInterface[];
        tasks: TaskInterface[];
    }>;

    if (!boardId) {
      throw new Error('Cant get boardID from url');
    }

    this.boardId = boardId;
    this.data$ = combineLatest([
        this.boardService.board$.pipe(filter(Boolean)),
        this.boardService.columns$,
        this.boardService.tasks$,
      ]).pipe(
        map(([board, columns, tasks]) => ({
          board,
          columns,
          tasks,
        }))
    );
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEventsEnum.boardsJoin, {
        boardId: this.boardId,
    });
    this.fetchData();
    this.initializeListeners();
  }

    initializeListeners(): void {
        this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
            this.boardService.leaveBoard(this.boardId);
        }
        });

        this.socketService
        .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
        .subscribe((column) => {
            this.boardService.addColumn(column);
        });

        this.socketService
        .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
        .subscribe((task) => {
            this.boardService.addTask(task);
        });
    }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).subscribe((board) => {
        this.boardService.setBoard(board);
    });
    this.columnsService.getColumns(this.boardId).subscribe((columns) => {
        this.boardService.setColumns(columns);
      });
    this.tasksService.getTasks(this.boardId).subscribe((tasks) => {
        this.boardService.setTasks(tasks);
    });
  }

  createColumn(title: string): void {
    const columnInput: ColumnInputInterface = {
      title,
      boardId: this.boardId,
    };
    this.columnsService.createColumn(columnInput);
  }

  createTask(title: string, columnId: string): void {
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.tasksService.createTask(taskInput);
  }

  getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

  updateBoardName(boardName: string): void {
    this.boardsService.updateBoard(this.boardId, { title: boardName });
  }
}
