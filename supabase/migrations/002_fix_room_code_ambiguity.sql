-- ============================================================================
-- BlendIn — Migration Patch: Fix ambiguous 'code' reference in generate_room_code()
-- File: supabase/migrations/002_fix_room_code_ambiguity.sql
--
-- The local variable `code` in generate_room_code() clashed with the
-- `rooms.code` column. Renamed local variable to `v_code` to fix.
-- ============================================================================

create or replace function generate_room_code()
returns text language plpgsql as $$
declare
  chars  text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- No ambiguous chars: 0/O/1/I/L
  v_code text;
  tries  int := 0;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;

    -- Ensure uniqueness among active (non-finished) rooms
    if not exists (select 1 from rooms where rooms.code = v_code and rooms.status != 'finished') then
      return v_code;
    end if;

    tries := tries + 1;
    if tries > 100 then
      raise exception 'Could not generate a unique room code after 100 attempts';
    end if;
  end loop;
end;
$$;
