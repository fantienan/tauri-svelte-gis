export type DriveRecord = {
  name: string;
  path: string;
  type: 'drive' | 'folder' | 'file';
  children?: DriveRecord[];
};
