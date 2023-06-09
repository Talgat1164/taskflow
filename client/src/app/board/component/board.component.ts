import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
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
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskUpdateInterface } from 'src/app/shared/types/taskUpdate.interface';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('board', { static: false }) board!: ElementRef;
  boardId: string;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;
  unsubscribe$ = new Subject<void>();

  userId: string | null = null;
  nickname: string | null = null; 

  private cursors = new Map<string, { userId: string; nickname: string; x: number; y: number }>();

  public getCursorValues(): IterableIterator<{
    userId: string;
    nickname: string;
    x: number;
    y: number;
  }> {
    return this.cursors.values();
  }
  

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private tasksService: TasksService,
    private authService: AuthService
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
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.nickname = user.username;
      }
    });
  }

  ngAfterViewInit(): void {
    this.board.nativeElement.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        this.socketService.emit(SocketEventsEnum.cursorPositionUpdate, {
          boardId: this.boardId,
          userId: this.userId, // Replace with your user identifier
          nickname: this.nickname, // Replace with the user's nickname
          x: event.clientX,
          y: event.clientY,
        });
      }
    );

    this.board.nativeElement.addEventListener('mouseleave', () => {
      this.socketService.emit(SocketEventsEnum.cursorLeave, {
        boardId: this.boardId,
        userId: this.userId, // Replace with your user identifier
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeListeners(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && !event.url.includes('/boards/')) {
        this.boardService.leaveBoard(this.boardId);
      }
    });

    this.socketService
      .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((column) => {
        this.boardService.addColumn(column);
      });

    this.socketService
      .listen<string>(SocketEventsEnum.columnsDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((columnId) => {
        this.boardService.deleteColumn(columnId);
      });

    this.socketService
      .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((task) => {
        this.boardService.addTask(task);
      });

    this.socketService
      .listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedBoard) => {
        this.boardService.updateBoard(updatedBoard);
      });

    this.socketService
      .listen<ColumnInterface>(SocketEventsEnum.columnsUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedColumn) => {
        this.boardService.updateColumn(updatedColumn);
      });

    this.socketService
      .listen<TaskInterface>(SocketEventsEnum.tasksUpdateSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updatedTask) => {
        this.boardService.updateTask(updatedTask);
      });

    this.socketService
      .listen<string>(SocketEventsEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((taskId) => {
        this.boardService.deleteTask(taskId);
      });

    this.socketService
      .listen<void>(SocketEventsEnum.boardsDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigateByUrl('/boards');
      });

      this.socketService
      .listen<{
        boardId: string;
        userId: string;
        nickname: string;
        x: number;
        y: number;
      }>(SocketEventsEnum.cursorPositionUpdate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ boardId, userId, nickname, x, y }) => {
        if (boardId === this.boardId && userId !== this.userId) {
          this.cursors.set(userId, { userId, nickname, x, y });
        }
      });
    
    this.socketService
      .listen<{ boardId: string; userId: string }>(SocketEventsEnum.cursorLeave)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ boardId, userId }) => {
        if (boardId === this.boardId && userId !== this.userId) {
          this.cursors.delete(userId);
        }
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

  updateColumnName(columnName: string, columnId: string): void {
    this.columnsService.updateColumn(this.boardId, columnId, {
      title: columnName,
    });
  }

  deleteBoard(): void {
    if (confirm('Are you sure you want to delete the board?')) {
      this.boardsService.deleteBoard(this.boardId);
    }
  }

  deleteColumn(columnId: string): void {
    this.columnsService.deleteColumn(this.boardId, columnId);
  }

  openTask(taskId: string): void {
    this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
  }

  onDrop(event: CdkDragDrop<TaskInterface[], any>) {
    const previousColumnId = event.previousContainer.id;
    const currentColumnId = event.container.id;

    const tasks = this.boardService.getTasksSnapshot();

    if (previousColumnId === currentColumnId) {
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        tasks.filter((task) => task.columnId === previousColumnId),
        tasks.filter((task) => task.columnId === currentColumnId),
        event.previousIndex,
        event.currentIndex
      );
    }

    const updatedTask: TaskUpdateInterface = {
      ...event.item.data,
      columnId: currentColumnId,
    };

    this.tasksService.updateTask(this.boardId, event.item.data.id, updatedTask);
  }
}
