import { Injectable, HttpException } from '@nestjs/common';

@Injectable()
export class AppService {
  private cache: any[] | null = null;
  private updating = false;

  constructor() {
    this.update();
    setInterval(() => this.update(), 60000);
  }

  private async update() {
    if (this.updating) return;
    this.updating = true;
    try {
      const res = await fetch('https://cloud.urbe.edu/web/v1/core/labComp/list');
      const newData = JSON.parse(await res.text());
      this.cache = null;  
      this.cache = newData;
    } catch (e) {
      console.error('Cache error:', e.message);
    } finally {
      this.updating = false;
    }
  }

  async getPersonPhoto(id: string) {
    while (!this.cache) await new Promise(r => setTimeout(r, 100));
    const p = this.cache.find((p: any) => String(p.id) === String(id));
    if (!p) throw new HttpException('ID no encontrado', 404);
    if (!p.fotografia?.fotografia) throw new HttpException('Sin foto', 404);
    return p.fotografia.fotografia;
  }
}