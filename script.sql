CREATE OR REPLACE FUNCTION find_best_rides(
    user_lat DECIMAL,
    user_lon DECIMAL,
    dest_lat DECIMAL,
    dest_lon DECIMAL,
    ride_date TIMESTAMP
) RETURNS TABLE (
    ride_id UUID,
    driver_id UUID,
    driver_name TEXT,
    driver_phone TEXT,
    start_location TEXT,
    start_lat DECIMAL(10, 6),
    start_lon DECIMAL(10, 6),
    destination_location TEXT,
    destination_lat DECIMAL(10, 6),
    destination_lon DECIMAL(10, 6),
    departure_time TIMESTAMP,
    available_seats INT,
    price DECIMAL(10, 2),
    waypoints JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH ride_routes AS (
        SELECT 
            r.id AS ride_id,
            r.driver_id,
            u.name AS driver_name,
            u.phone AS driver_phone,
            r.start_location,
            r.start_lat,
            r.start_lon,
            r.end_location AS destination_location,
            r.end_lat AS destination_lat,
            r.end_lon AS destination_lon,
            r.departure_time,
            r.available_seats,
            r.price,
            
            -- Compute route geometry dynamically from waypoints
            ST_MakeLine(ST_MakePoint(w.lon, w.lat) ORDER BY w.created_at) AS route_geom,

            -- Aggregate waypoints as JSONB
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'lat', w.lat, 
                    'lon', w.lon, 
                    'location_name', 'Waypoint'
                ) ORDER BY w.created_at ASC
            ) AS waypoints
        FROM rides r
        JOIN users u ON r.driver_id = u.id
        LEFT JOIN waypoints w ON w.ride_id = r.id  -- Use waypoints to create route_geom dynamically
        WHERE r.departure_time >= ride_date
          AND r.available_seats > 0
        GROUP BY r.id, r.driver_id, u.name, u.phone, r.start_location, r.start_lat, r.start_lon, 
                 r.end_location, r.end_lat, r.end_lon, r.departure_time, r.available_seats, 
                 r.price
    )
    
    SELECT 
        rr.ride_id, rr.driver_id, rr.driver_name, rr.driver_phone, rr.start_location, 
        rr.start_lat, rr.start_lon, rr.destination_location, rr.destination_lat, rr.destination_lon, 
        rr.departure_time, rr.available_seats, rr.price, rr.waypoints
    FROM ride_routes rr
    WHERE 
        rr.route_geom IS NOT NULL
        AND ST_Intersects(
            ST_Buffer(ST_MakePoint(user_lon, user_lat)::geography, 20000), 
            rr.route_geom::geography
        )
        AND ST_Intersects(
            ST_Buffer(ST_MakePoint(dest_lon, dest_lat)::geography, 20000), 
            rr.route_geom::geography
        )
    ORDER BY rr.departure_time ASC, rr.available_seats DESC;
END;
$$ LANGUAGE plpgsql;