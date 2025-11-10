import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import sequelize from '../database/coneccion';
import sinchronize from '../database/index';
import routerUser from '../routers/router_user';
import routerFriends from '../routers/router_friends';
import routerPublicaciones from '../routers/router_publicaciones';
import comentarioRouter from '../routers/router_comentarios';
import denunciaRouter from '../routers/router_denuncias';
import routerSuscripcion from '../routers/router_suscripcion';
import likeRouter from '../routers/router_likes';
import historialRouter from '../routers/router_historia';
import { connectRedis } from '../database/redis';
import path from 'path';

class Server {
  public app: Application;
  public puerto: string;

  constructor() {
    this.app = express();
    this.puerto = process.env.PORT || '8080';
    this.middlewares();
    this.routes();
    this.dbConnection();
    this.connectRedis();
    this.listen();
    this.app.use(cors({
      origin: ['*'],
      exposedHeaders: ['Authorization', 'authorization'],
    }));
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private routes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.json({ msg: 'API BLOG corriendo correctamente 🚀' });
    });
    //servir archivos estaticos
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    //routes:
    this.app.use('/api/users', routerUser); 
    //amigos
    this.app.use('/api/friends', routerFriends);
    //publicaciones
    this.app.use('/api/publicaciones', routerPublicaciones);
    //comentarios
    this.app.use('/api/comentarios', comentarioRouter);
    //denuncias
    this.app.use('/api/denuncias', denunciaRouter);
    //suscripciones
    this.app.use('/api/suscripciones', routerSuscripcion);
    //likes
    this.app.use('/api/likes', likeRouter);
    //historial de lectura
    this.app.use('/api/historial-lectura', historialRouter);

  }

  private async sinchronize(): Promise<void> {
    try {
      //await sinchronize;
      console.log('✅ Modelos sincronizados con la base de datos');
    } catch (error) {
      console.error('❌ Error al sincronizar los modelos:', error);
    }
  }

  private async connectRedis(): Promise<void> {
    try {
      await connectRedis();
    } catch (error) {
      console.error('❌ Error al conectar con Redis:', error);
    }
  }

  private async dbConnection(): Promise<void> {
    try {
      await sequelize.authenticate();
      console.log('✅ Conectado a la base de datos');
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);
    }
  }

  private listen(): void {
    this.app.listen(this.puerto, () => {
      console.log(`🟢 Servidor corriendo en el puerto localhost:${this.puerto}`);
    });
  }
}

export default Server;
