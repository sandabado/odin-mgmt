-- Keep the canonical Sandābādo portrait path with the artist record. The
-- optimized derivative is versioned with the public site so every environment
-- resolves the same durable URL.
update public.artists
set
  photo_url = '/images/artists/sandabado/sandabado-joshua-tree-portrait.jpg',
  updated_at = now()
where lower(artist_name) in (lower('Sandābādo'), lower('Sandabado'));
