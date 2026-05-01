from fastapi import WebSocket
from datetime import datetime


class NotificationManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        self.active_connections.append(websocket)
        print(f"✅ Client connecté | total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"❌ Client déconnecté | total: {len(self.active_connections)}")

    async def send_notification(self, notification: dict):
        """Envoie une notification à tous les clients connectés."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(notification)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = NotificationManager()