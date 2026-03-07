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
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', imageBuffer.length);
      res.send(imageBuffer);
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('Error al mostrar la foto', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}