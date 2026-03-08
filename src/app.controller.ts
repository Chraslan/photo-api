import { Controller, Get, Param, Res, HttpException, HttpStatus, Query, Logger } from '@nestjs/common';
import express from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}
  
  @Get('photo')
  async getPhoto(@Query('id') id: string) {
    try {
      // Obtener la persona completa del servicio (CON FOTO INCLUIDA)
      const persona = await this.appService.getPerson(id);
      
      if (!persona) {
        throw new HttpException('ID no encontrado', HttpStatus.NOT_FOUND);
      }
      
      // Devolver el objeto JSON completo, tal como viene de la API
      return persona;
      
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('Error al obtener la información', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Endpoint opcional para obtener SOLO la imagen (si la necesitas)
  @Get('photo-image')
  async getPhotoImage(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const base64Image = await this.appService.getPersonPhoto(id);
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      this.logger.log(`Enviando imagen de ${imageBuffer.length} bytes`);
      res.send(imageBuffer);
      
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      res.status(404).send('Imagen no encontrada');
    }
  }
  
  @Get('photo-debug')
  async getPhotoDebug(@Query('id') id: string) {
    try {
      const persona = await this.appService.getPerson(id);
      
      return { 
        success: true, 
        message: 'Persona encontrada',
        id: persona.id,
        nombre: `${persona.primerNombre} ${persona.primerApellido}`,
        tieneFoto: !!(persona.fotografia?.fotografia),
        fotoLength: persona.fotografia?.fotografia?.length || 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
