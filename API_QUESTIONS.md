# API & Feature Questions

Please answer these questions to ensure full functionality:

1. **File Browser Listing**: 
   - My code currently calls `GET /files/?path=/` to list directories.
   - The provided documentation only lists `GET /files/download/`.
   - **Question**: Does the browsing endpoint `/files/?path=` exist? If not, how can we list files?

2. **Cover Art**:
   - The `Song` model in the docs doesn't list a `cover_url` or `image` field.
   - **Question**: Where can we get album artwork? Is there a metadata endpoint or a convention (e.g. `cover.jpg` in the song folder)?

3. **Producers**:
   - The documentation mentions `producers` as a string field on `Song`.
   - **Question**: Is there a dedicated endpoint to list all producers (e.g. `/producers`)? Currently, I aggregate them client-side from the first page of songs, which is incomplete.

4. **Lyrics Search**:
   - The docs mention `lyrics` parameter for search.
   - **Question**: Does this return snippet highlights, or just filter the song list?

5. **Streaming Auth**:
   - **Question**: Does the `/files/download/` endpoint require the `Authorization` header if the API is public? (Currently typically public APIs don't, but streaming might differ).
