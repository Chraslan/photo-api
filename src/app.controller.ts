import { Controller, Get, Param, Res, HttpException, HttpStatus, Query, Logger } from '@nestjs/common';
import express from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}
  
  @Get('photo')
  async getPhoto(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const base64Image = await this.appService.getPersonPhoto(id);
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // HEADERS ANTI-CACHÉ PARA RENDER
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('X-Render-Origin', 'direct'); // Ayuda a Render a entender que no debe cachear
      
      // También puedes añadir un header único para evitar caché
      res.setHeader('X-No-Cache', Date.now().toString());
      
      this.logger.log(`Enviando imagen de ${imageBuffer.length} bytes con headers anti-caché`);
      res.send(imageBuffer);
      
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('Error al mostrar la foto', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Endpoint de prueba para verificar headers
  @Get('photo-debug')
  async getPhotoDebug(@Query('id') id: string) {
    try {
      const base64Image = await this.appService.getPersonPhoto(id);
      return { 
        success: true, 
        message: 'Foto obtenida correctamente',
        base64Length: base64Image.length,
        preview: base64Image.substring(0, 100) + '...'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
