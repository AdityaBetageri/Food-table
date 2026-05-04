/**
 * Socket.io Event Handler
 * Manages real-time connections between Customer, Admin, and Chef
 *
 * Room Strategy: Each client joins `hotel_{hotelId}` room
 * This ensures events are only broadcast to clients of the same hotel
 */
function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Join hotel room — called by dashboard clients after auth
     * Data: { hotelId }
     */
    socket.on('join_hotel', (data) => {
      if (data && data.hotelId) {
        const room = `hotel_${data.hotelId}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room: ${room}`);
        socket.emit('joined', { room, message: 'Connected to hotel room' });
      }
    });

    /**
     * Call Waiter — customer sends alert to dashboard
     * Data: { hotelId, tableNumber }
     */
    socket.on('call_waiter', (data) => {
      if (data && data.hotelId) {
        io.to(`hotel_${data.hotelId}`).emit('call_waiter', {
          tableNumber: data.tableNumber,
          message: `Table ${data.tableNumber} is calling for a waiter!`,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket] Waiter called for table ${data.tableNumber}`);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });
}

module.exports = setupSocket;
