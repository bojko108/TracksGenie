# TracksGenie

Library for processing and matching GPS tracks.

## Info

1. Densify base lines.
2. Build spatial index from base line's vertices
3. Simplify input line
4. Test input line's vertices for matching with the spatial index.



-----------------------------
1. Put base tracks into a KDTree - vertices only
2. Create buffer arround base tracks
3. Intersect the new track with generated buffer 
4. Remove overlapping segments from the new track
5. Connect the new track with closest base track
- closest point at distance: buffer_distance + 1m (is it enough?)

## Dependencies

- [KDBush](https://www.npmjs.com/package/kdbush)
- [Line Split](https://www.npmjs.com/package/@turf/line-split)

## License

transformations is [MIT](https://github.com/bojko108/TracksGenie/tree/master/LICENSE) License @ bojko108
