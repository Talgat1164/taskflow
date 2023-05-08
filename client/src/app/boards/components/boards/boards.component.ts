import { Component, OnInit } from '@angular/core';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { BoardInterface } from 'src/app/shared/types/board.interface';

@Component({
  selector: 'boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})

export class BoardsComponent implements OnInit {
  boards: BoardInterface[] = [];
  filteredBoards: BoardInterface[] = [];
  filter: string = '';
  sortOption: string = 'date';

  constructor(private boardsService: BoardsService) {}

  ngOnInit(): void {
    this.boardsService.getBoards().subscribe((boards) => {
      this.boards = boards;
      this.sortBoards();
      this.filterBoards();
    });
  }

  createBoard(title: string): void {
    this.boardsService.createBoard(title).subscribe((createdBoard) => {
      this.boards = [...this.boards, createdBoard];
      this.filterBoards();
    });
  }

  filterBoards(): void {
    const filterLowerCase = this.filter.toLowerCase();
    this.filteredBoards = this.boards.filter((board) =>
      board.title.toLowerCase().includes(filterLowerCase)
    );
  }

  sortBoards(): void {
    const sortedBoards = [...this.boards];
    if (this.sortOption === 'date') {
      sortedBoards.sort((a, b) => b.createdAt - a.createdAt);
    } else if (this.sortOption === 'alphabet') {
      sortedBoards.sort((a, b) => a.title.localeCompare(b.title));
    }
    this.filteredBoards = sortedBoards.filter((board) =>
      board.title.toLowerCase().includes(this.filter.toLowerCase())
    );
  }
}
