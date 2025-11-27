// [消息网关] 基于WebSocket的实时订单消息广播网关
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  sendNewOrderEvent(order: any) {

    this.server.emit('newOrder', order);
  }
}