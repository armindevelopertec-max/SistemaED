import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, BucketItem } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  public minioClient: Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'smia-documents');
  }

  async onModuleInit() {
    await this.verificarBucket();
  }

  private async verificarBucket() {
    try {
      const existe = await this.minioClient.bucketExists(this.bucketName);
      if (!existe) {
        await this.minioClient.makeBucket(this.bucketName);
        console.log(`Bucket ${this.bucketName} creado`);
      }
    } catch (error) {
      console.error('Error al verificar/crear bucket:', error);
    }
  }

  async subirArchivo(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<{ url: string; fileName: string }> {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname}`;
    const buffer = file.buffer;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        buffer,
        buffer.length,
        { 'Content-Type': file.mimetype }
      );

      const url = await this.obtenerUrlPresignada(fileName);
      return { url, fileName };
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw new InternalServerErrorException('Error al subir archivo a MinIO');
    }
  }

  async obtenerUrlPresignada(fileName: string, expiry: number = 3600): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(this.bucketName, fileName, expiry);
      return url;
    } catch (error) {
      console.error('Error al generar URL presignada:', error);
      throw new InternalServerErrorException('Error al generar URL');
    }
  }

  async eliminarArchivo(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw new InternalServerErrorException('Error al eliminar archivo');
    }
  }

  async listarArchivos(prefix: string = ''): Promise<BucketItem[]> {
    try {
      const files: BucketItem[] = [];
      const stream = await this.minioClient.listObjects(this.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (item: BucketItem) => files.push(item));
        stream.on('error', reject);
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      console.error('Error al listar archivos:', error);
      throw new InternalServerErrorException('Error al listar archivos');
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
