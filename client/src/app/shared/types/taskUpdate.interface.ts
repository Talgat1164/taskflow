export interface TaskUpdateInterface {
  id: string;
  title?: string;
  columnId?: string;
  boardId?: string;
  order?: number;
  dueDate?: string | null;
}
