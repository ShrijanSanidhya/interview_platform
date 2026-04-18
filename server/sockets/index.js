module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId);
      console.log(`${user.name} joined room ${roomId}`);
      // Notify other participants
      socket.to(roomId).emit('user-joined', { message: `${user.name} joined the room.`, user });
    });

    socket.on('code-change', ({ roomId, code }) => {
      // Broadcast code change to others in the room
      socket.to(roomId).emit('code-sync', code);
    });
    
    socket.on('code-executed', ({ roomId, result }) => {
      io.to(roomId).emit('evaluation-result', result);
    });

    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('receive-message', { message, user, timestamp: new Date() });
    });

    socket.on('typing', ({ roomId, user }) => {
      socket.to(roomId).emit('user-typing', user.name || 'User');
    });

    socket.on('sync-timer', ({ roomId, timeStr }) => {
      socket.to(roomId).emit('timer-update', timeStr);
    });

    socket.on('leave-room', ({ roomId, user }) => {
      socket.leave(roomId);
      if (user) {
         socket.to(roomId).emit('user-left', { message: `${user.name} left the room.`, user });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
