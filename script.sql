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

----  24 feb 2025 ----

CREATE OR REPLACE FUNCTION find_best_rides(
    user_lat DECIMAL,
    user_lon DECIMAL,
    dest_lat DECIMAL,
    dest_lon DECIMAL,
    ride_date TIMESTAMP,
    search_radius INT DEFAULT 20000 -- New parameter (radius in meters, default 20km)
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
            ST_Buffer(ST_MakePoint(user_lon, user_lat)::geography, search_radius), 
            rr.route_geom::geography
        )
        AND ST_Intersects(
            ST_Buffer(ST_MakePoint(dest_lon, dest_lat)::geography, search_radius), 
            rr.route_geom::geography
        )
    ORDER BY rr.departure_time ASC, rr.available_seats DESC;
END;
$$ LANGUAGE plpgsql;

---- 24 feb 2025 v2----

CREATE OR REPLACE FUNCTION find_best_rides(
    user_lat DECIMAL,
    user_lon DECIMAL,
    dest_lat DECIMAL,
    dest_lon DECIMAL,
    ride_date TIMESTAMP,
    search_radius INT DEFAULT 20000 -- Radius in meters, default 20km
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
    waypoints JSONB,
    route_distance_meters DECIMAL,
    efficiency_score DECIMAL
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
            
            -- Construct route geometry: start → waypoints (sorted) → end
            ST_MakeLine(
                ARRAY(
                    SELECT ST_MakePoint(lon, lat)
                    FROM (
                        -- Start point first
                        SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                        UNION ALL
                        -- Waypoints sorted by created_at
                        SELECT w.lon, w.lat, 1 AS order_val, w.created_at
                        FROM waypoints w
                        WHERE w.ride_id = r.id
                        UNION ALL
                        -- End point last
                        SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                    ) AS points
                    ORDER BY order_val, created_at NULLS LAST
                )
            ) AS route_geom,

            -- Aggregate waypoints as JSONB, exactly matching your working version
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'lat', w.lat,
                    'lon', w.lon,
                    'location_name', COALESCE(w.location_name, 'Waypoint')  -- Use actual location_name or default to 'Waypoint'
                ) ORDER BY w.created_at ASC
            ) AS waypoints,

            -- Calculate route distance in meters and cast to DECIMAL
            CAST(
                ST_Length(
                    ST_MakeLine(
                        ARRAY(
                            SELECT ST_MakePoint(lon, lat)
                            FROM (
                                SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                                UNION ALL
                                SELECT w.lon, w.lat, 1 AS order_val, w.created_at
                                FROM waypoints w
                                WHERE w.ride_id = r.id
                                UNION ALL
                                SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                            ) AS points
                            ORDER BY order_val, created_at NULLS LAST
                        )
                    )::geography
                ) AS DECIMAL
            ) AS route_distance_meters

        FROM rides r
        JOIN users u ON r.driver_id = u.id
        LEFT JOIN waypoints w ON w.ride_id = r.id
        WHERE r.departure_time >= ride_date - INTERVAL '15 minutes'
          AND r.available_seats > 0
        GROUP BY r.id, r.driver_id, u.name, u.phone, r.start_location, r.start_lat, r.start_lon,
                 r.end_location, r.end_lat, r.end_lon, r.departure_time, r.available_seats, r.price
    ),
    filtered_rides AS (
        SELECT 
            rr.ride_id, rr.driver_id, rr.driver_name, rr.driver_phone, rr.start_location,
            rr.start_lat, rr.start_lon, rr.destination_location, rr.destination_lat, rr.destination_lon,
            rr.departure_time, rr.available_seats, rr.price, rr.waypoints, 
            rr.route_geom, rr.route_distance_meters,
            -- Efficiency score: price per meter (lower is better), cast to DECIMAL
            CAST(
                CASE 
                    WHEN rr.route_distance_meters > 0 
                    THEN rr.price / rr.route_distance_meters 
                    ELSE NULL 
                END AS DECIMAL
            ) AS efficiency_score,
            -- Check progression along the route for directionality
            ST_LineLocatePoint(rr.route_geom, ST_MakePoint(user_lon, user_lat)) AS start_progress,
            ST_LineLocatePoint(rr.route_geom, ST_MakePoint(dest_lon, dest_lat)) AS dest_progress
        FROM ride_routes rr
        WHERE 
            rr.route_geom IS NOT NULL
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(user_lon, user_lat)::geography, search_radius),
                rr.route_geom::geography
            )
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(dest_lon, dest_lat)::geography, search_radius),
                rr.route_geom::geography
            )
    )
    SELECT 
        fr.ride_id, fr.driver_id, fr.driver_name, fr.driver_phone, fr.start_location,
        fr.start_lat, fr.start_lon, fr.destination_location, fr.destination_lat, fr.destination_lon,
        fr.departure_time, fr.available_seats, fr.price, fr.waypoints,
        fr.route_distance_meters, fr.efficiency_score
    FROM filtered_rides fr
    WHERE fr.dest_progress > fr.start_progress -- Ensure ride progresses from start to dest
    ORDER BY fr.efficiency_score ASC NULLS LAST, fr.departure_time ASC, fr.available_seats DESC;
END;
$$ LANGUAGE plpgsql;

---- 24 feb 2025 v3----

CREATE OR REPLACE FUNCTION find_best_rides(
    user_lat DECIMAL,
    user_lon DECIMAL,
    dest_lat DECIMAL,
    dest_lon DECIMAL,
    ride_date TIMESTAMP,
    search_radius INT DEFAULT 20000 -- Radius in meters, default 20km
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
    waypoints JSONB,
    route_distance_meters DECIMAL,
    efficiency_score DECIMAL
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
            r.end_lon AS destination_lon,  -- Ensure end_lon is explicitly included
            r.departure_time,
            r.available_seats,
            r.price,
            
            -- Construct route geometry: start → waypoints (sorted) → end
            ST_MakeLine(
                ARRAY(
                    SELECT ST_MakePoint(lon, lat)
                    FROM (
                        -- Start point first
                        SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                        UNION ALL
                        -- Waypoints sorted by created_at
                        SELECT w.lon, w.lat, 1 AS order_val, w.created_at
                        FROM waypoints w
                        WHERE w.ride_id = r.id
                        UNION ALL
                        -- End point last
                        SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                    ) AS points
                    ORDER BY order_val, created_at NULLS LAST
                )
            ) AS route_geom,

            -- Aggregate waypoints as JSONB, using actual location_name or default to 'Waypoint' if NULL
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'lat', w.lat,
                    'lon', w.lon,
                    'location_name', COALESCE(w.location_name, 'Waypoint')
                ) ORDER BY w.created_at ASC
            ) AS waypoints,

            -- Calculate route distance in meters and cast to DECIMAL
            CAST(
                ST_Length(
                    ST_MakeLine(
                        ARRAY(
                            SELECT ST_MakePoint(lon, lat)
                            FROM (
                                SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                                UNION ALL
                                SELECT w.lon, w.lat, 1 AS order_val, w.created_at
                                FROM waypoints w
                                WHERE w.ride_id = r.id
                                UNION ALL
                                SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                            ) AS points
                            ORDER BY order_val, created_at NULLS LAST
                        )
                    )::geography
                ) AS DECIMAL
            ) AS route_distance_meters

        FROM rides r
        JOIN users u ON r.driver_id = u.id
        LEFT JOIN waypoints w ON w.ride_id = r.id
        WHERE r.departure_time >= ride_date - INTERVAL '15 minutes'
          AND r.available_seats > 0
        GROUP BY r.id, r.driver_id, u.name, u.phone, r.start_location, r.start_lat, r.start_lon,
                 r.end_location, r.end_lat, r.end_lon, r.departure_time, r.available_seats, r.price
    ),
    filtered_rides AS (
        SELECT 
            rr.ride_id, rr.driver_id, rr.driver_name, rr.driver_phone, rr.start_location,
            rr.start_lat, rr.start_lon, rr.destination_location, rr.destination_lat, rr.destination_lon,
            rr.departure_time, rr.available_seats, rr.price, rr.waypoints, 
            rr.route_geom, rr.route_distance_meters,
            -- Efficiency score: price per meter (lower is better), cast to DECIMAL
            CAST(
                CASE 
                    WHEN rr.route_distance_meters > 0 
                    THEN rr.price / rr.route_distance_meters 
                    ELSE NULL 
                END AS DECIMAL
            ) AS efficiency_score,
            -- Check progression along the route for directionality using start/end points
            ST_LineLocatePoint(rr.route_geom, ST_MakePoint(user_lon, user_lat)) AS user_start_progress,
            ST_LineLocatePoint(rr.route_geom, ST_MakePoint(dest_lon, dest_lat)) AS user_dest_progress,
            -- Calculate distances to ensure ride direction matches user request
            ST_Distance(
                ST_MakePoint(rr.start_lon, rr.start_lat)::geography,
                ST_MakePoint(user_lon, user_lat)::geography
            ) AS start_dist_to_user,
            ST_Distance(
                ST_MakePoint(rr.destination_lon, rr.destination_lat)::geography,  -- Updated to use destination_lon/lat
                ST_MakePoint(dest_lon, dest_lat)::geography
            ) AS end_dist_to_dest
        FROM ride_routes rr
        WHERE 
            rr.route_geom IS NOT NULL
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(user_lon, user_lat)::geography, search_radius),
                rr.route_geom::geography
            )
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(dest_lon, dest_lat)::geography, search_radius),
                rr.route_geom::geography
            )
    )
    SELECT 
        fr.ride_id, fr.driver_id, fr.driver_name, fr.driver_phone, fr.start_location,
        fr.start_lat, fr.start_lon, fr.destination_location, fr.destination_lat, fr.destination_lon,
        fr.departure_time, fr.available_seats, fr.price, fr.waypoints,
        fr.route_distance_meters, fr.efficiency_score
    FROM filtered_rides fr
    WHERE 
        -- Ensure the ride starts near the user’s start and ends near the user’s destination
        fr.user_start_progress <= fr.user_dest_progress  -- Ride progresses from user start to user destination
        -- Additional check: ride start should be closer to user start, and ride end closer to user destination
        AND fr.start_dist_to_user < fr.end_dist_to_dest
    ORDER BY fr.efficiency_score ASC NULLS LAST, fr.departure_time ASC, fr.available_seats DESC;
END;
$$ LANGUAGE plpgsql;

---- 24 feb 2025 v4----

CREATE OR REPLACE FUNCTION find_best_rides(
    user_lat DECIMAL,
    user_lon DECIMAL,
    dest_lat DECIMAL,
    dest_lon DECIMAL,
    ride_date TIMESTAMP,
    search_radius INT DEFAULT 20000 -- Radius in meters, default 20km
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
    waypoints JSONB,
    route_distance_meters DECIMAL,
    efficiency_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH waypoint_orders AS (
        -- Calculate waypoint orders for each ride using created_at and geographical distance
        SELECT 
            w.ride_id,
            w.lat,
            w.lon,
            w.created_at,
            COALESCE(w.location_name, 'Waypoint') AS location_name,
            ROW_NUMBER() OVER (PARTITION BY w.ride_id ORDER BY w.created_at, ST_Distance(ST_MakePoint(w.lon, w.lat)::geography, ST_MakePoint(r.start_lon, r.start_lat)::geography)) AS waypoint_order
        FROM waypoints w
        JOIN rides r ON w.ride_id = r.id
    ),
    ride_routes AS (
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
            
            -- Construct route geometry: start → waypoints (sorted) → end
            ST_MakeLine(
                ARRAY(
                    SELECT ST_MakePoint(lon, lat)
                    FROM (
                        SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                        UNION ALL
                        SELECT wo.lon, wo.lat, 1 AS order_val, wo.created_at
                        FROM waypoint_orders wo
                        WHERE wo.ride_id = r.id
                        UNION ALL
                        SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                    ) AS points
                    ORDER BY order_val, created_at NULLS LAST
                )
            ) AS route_geom,

            -- Aggregate waypoints as JSONB using pre-computed order
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'lat', wo.lat,
                    'lon', wo.lon,
                    'location_name', wo.location_name,
                    'created_at', wo.created_at,
                    'order', wo.waypoint_order
                ) ORDER BY wo.waypoint_order ASC
            ) AS waypoints,

            -- Calculate route distance
            CAST(
                ST_Length(
                    ST_MakeLine(
                        ARRAY(
                            SELECT ST_MakePoint(lon, lat)
                            FROM (
                                SELECT r.start_lon AS lon, r.start_lat AS lat, 0 AS order_val, NULL::TIMESTAMP AS created_at
                                UNION ALL
                                SELECT wo.lon, wo.lat, 1 AS order_val, wo.created_at
                                FROM waypoint_orders wo
                                WHERE wo.ride_id = r.id
                                UNION ALL
                                SELECT r.end_lon AS lon, r.end_lat AS lat, 2 AS order_val, NULL::TIMESTAMP AS created_at
                            ) AS points
                            ORDER BY order_val, created_at NULLS LAST
                        )
                    )::geography
                ) AS DECIMAL
            ) AS route_distance_meters

        FROM rides r
        JOIN users u ON r.driver_id = u.id
        LEFT JOIN waypoint_orders wo ON wo.ride_id = r.id
        WHERE r.departure_time >= ride_date - INTERVAL '15 minutes'
          AND r.available_seats > 0
        GROUP BY r.id, r.driver_id, u.name, u.phone, r.start_location, r.start_lat, r.start_lon,
                 r.end_location, r.end_lat, r.end_lon, r.departure_time, r.available_seats, r.price
    ),
    filtered_rides AS (
        SELECT 
            rr.ride_id, rr.driver_id, rr.driver_name, rr.driver_phone, rr.start_location,
            rr.start_lat, rr.start_lon, rr.destination_location, rr.destination_lat, rr.destination_lon,
            rr.departure_time, rr.available_seats, rr.price, rr.waypoints, 
            rr.route_geom, rr.route_distance_meters,
            
            CAST(
                CASE 
                    WHEN rr.route_distance_meters > 0 
                    THEN rr.price / rr.route_distance_meters 
                    ELSE NULL 
                END AS DECIMAL
            ) AS efficiency_score,

            -- Compute distances to user start and destination
            ST_Distance(
                ST_MakePoint(rr.start_lon, rr.start_lat)::geography,
                ST_MakePoint(user_lon, user_lat)::geography
            ) AS start_dist_to_user,
            ST_Distance(
                ST_MakePoint(rr.destination_lon, rr.destination_lat)::geography,
                ST_MakePoint(dest_lon, dest_lat)::geography
            ) AS end_dist_to_dest

        FROM ride_routes rr
        WHERE 
            rr.route_geom IS NOT NULL
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(user_lon, user_lat)::geography, search_radius),
                rr.route_geom::geography
            )
            AND ST_Intersects(
                ST_Buffer(ST_MakePoint(dest_lon, dest_lat)::geography, search_radius),
                rr.route_geom::geography
            )
            -- Directional check: Ensure user's start is near ride's start or early waypoint (within 1km)
            AND EXISTS (
                SELECT 1 
                FROM (
                    -- Start point
                    SELECT rr.start_lat AS lat, rr.start_lon AS lon, 0 AS waypoint_order
                    UNION ALL
                    -- Early waypoints (first 10% of route)
                    SELECT wo.lat, wo.lon, wo.waypoint_order
                    FROM waypoint_orders wo
                    WHERE wo.ride_id = rr.ride_id
                    AND wo.waypoint_order <= GREATEST(1, (SELECT COUNT(*) * 0.1 FROM JSONB_ARRAY_ELEMENTS(rr.waypoints)))
                ) AS start_points
                WHERE ST_DWithin(
                    ST_MakePoint(start_points.lon, start_points.lat)::geography,
                    ST_MakePoint(user_lon, user_lat)::geography,
                    5000  -- 1km radius for stricter matching
                )
            )
            -- Directional check: Ensure user's destination is near ride's end or late waypoint (within 1km)
            AND EXISTS (
                SELECT 1 
                FROM (
                    -- End point
                    SELECT rr.destination_lat AS lat, rr.destination_lon AS lon, 
                           (SELECT COUNT(*) + 1 FROM JSONB_ARRAY_ELEMENTS(rr.waypoints)) AS waypoint_order
                    UNION ALL
                    -- Late waypoints (last 10% of route)
                    SELECT wo.lat, wo.lon, wo.waypoint_order
                    FROM waypoint_orders wo
                    WHERE wo.ride_id = rr.ride_id
                    AND wo.waypoint_order >= (SELECT GREATEST(1, (SELECT COUNT(*) * 0.9 FROM JSONB_ARRAY_ELEMENTS(rr.waypoints))))
                ) AS end_points
                WHERE ST_DWithin(
                    ST_MakePoint(end_points.lon, end_points.lat)::geography,
                    ST_MakePoint(dest_lon, dest_lat)::geography,
                    5000  -- 1km radius for stricter matching
                )
                AND end_points.waypoint_order > (
                    SELECT MIN(start_points.waypoint_order)
                    FROM (
                        -- Start point
                        SELECT rr.start_lat AS lat, rr.start_lon AS lon, 0 AS waypoint_order
                        UNION ALL
                        -- Early waypoints (first 10% of route)
                        SELECT wo.lat, wo.lon, wo.waypoint_order
                        FROM waypoint_orders wo
                        WHERE wo.ride_id = rr.ride_id
                        AND wo.waypoint_order <= GREATEST(1, (SELECT COUNT(*) * 0.1 FROM JSONB_ARRAY_ELEMENTS(rr.waypoints)))
                    ) AS start_points
                    WHERE ST_DWithin(
                        ST_MakePoint(start_points.lon, start_points.lat)::geography,
                        ST_MakePoint(user_lon, user_lat)::geography,
                        5000
                    )
                )
            )
    )
    SELECT 
        fr.ride_id, fr.driver_id, fr.driver_name, fr.driver_phone, fr.start_location,
        fr.start_lat, fr.start_lon, fr.destination_location, fr.destination_lat, fr.destination_lon,
        fr.departure_time, fr.available_seats, fr.price, fr.waypoints,
        fr.route_distance_meters, fr.efficiency_score
    FROM filtered_rides fr
    ORDER BY fr.efficiency_score ASC NULLS LAST, fr.departure_time ASC, fr.available_seats DESC;
END;
$$ LANGUAGE plpgsql;