-- Enable realtime for the tables needed for multiplayer lobbies
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_participants;
