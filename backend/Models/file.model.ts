export interface UploadedFileRepsponse {
  id: string;
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  uploaderId: string;
  createdAt: Date;
}

export interface FileUploadDto {
}
