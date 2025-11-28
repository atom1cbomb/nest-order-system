/**
 * @file server/src/events/events.gateway.ts
 * @description WebSocket 消息网关，用于实时订单广播（socket.io）
 */
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