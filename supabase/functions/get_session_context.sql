
CREATE OR REPLACE FUNCTION get_session_context(session_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH session_data AS (
    SELECT 
      s.title,
      s.summary,
      s.attention_avg,
      s.understanding_avg,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'content', n.content,
            'created_at', n.created_at
          )
        )
        FROM notes_storage n 
        WHERE n.session_id = s.id
        ), '[]'::json
      ) as notes,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'tag_text', st.tag_text,
            'timestamp', st.timestamp
          )
        )
        FROM session_tags st 
        WHERE st.session_id = s.id
        ), '[]'::json
      ) as tags,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'type', se.event_type,
            'content', se.content,
            'value', se.value,
            'timestamp', se.timestamp
          )
        )
        FROM session_events se 
        WHERE se.session_id = s.id
        ), '[]'::json
      ) as events
    FROM sessions s
    WHERE s.id = session_id
  )
  SELECT json_build_object(
    'session', row_to_json(session_data)
  )
  INTO result
  FROM session_data;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
