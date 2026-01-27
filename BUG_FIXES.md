# 🐛 BUG_FIXES.md

### --------------------------------------------------------------------------------------------------------------------------###

## 1. Login Failed Intermittently with Correct Credentials
### Location
- `database/seed.sql` (lines 6–9)
- `backend/routes/auth.js` (line 36)

### What Was Wrong

1. **Incorrect password hash in seed data**   - `database/seed.sql` (lines 6–9)
   The password stored in the seed file did not correctly correspond to the intended plaintext password.  
   As a result, `bcrypt.compare()` failed even when valid credentials were provided.

2. **Missing `await` in bcrypt password comparison**  - `backend/routes/auth.js` (line 36)
   `bcrypt.compare()` is asynchronous and returns a Promise.  
   Without `await`, the comparison result was not resolved properly, leading to inconsistent authentication behavior.

3. **Environment variables not initialized**   - `backend/routes/auth.js` (line 5 and 7)
   Environment variables were accessed before calling `dotenv.config()`.  
   This caused `JWT_SECRET` (and potentially other variables) to be `undefined`, resulting in token generation issues.

### How It Was Fixed

1. **Updated seed password hash**  
   The seed data was updated with a valid bcrypt hash generated from the intended test password.

2. **Added `await` to bcrypt comparison**
   ```js
   const isValidPassword = await bcrypt.compare(password, user.password);


## Why the Fix Is Correct

- A valid bcrypt hash ensures password verification behaves as expected.

- Awaiting bcrypt.compare() guarantees that authentication logic uses the resolved boolean result.

- Initializing environment variables before access ensures consistent JWT generation and configuration behavior.

- Together, these fixes restore a stable and reliable login flow.


 ## Result
- Login now works consistently with correct credentials across all application restarts.

### --------------------------------------------------------------------------------------------------------------------------###

## 2. Check-in form doesn't submit properly & Checkout was failing
## Location
 -  `frontend/src/utils/api.js`(Line No.4)
 -  `backend/routes/checkin.js`(Lines- 50,65,64 )
 -  `backend/routes/checkin.js`(Lines- 95 )


### What Was Wrong      
1. **Incorrect API base URL configuration in frontend**   - `frontend/src/utils/api.js` (lines 6–9)
  The Axios instance was using a relative or hardcoded base URL while backend services were running on different routes or ports.
  This caused check-in API requests to intermittently hit incorrect endpoints.    

2. **Incorrect SQL string comparison in SQLite query**   - `backend/routes/checkin.js`(Lines- 50,65 )
     The backend query used double quotes for string comparison: `status = "checked_in"`   
     In SQLite, double quotes are treated as identifiers (column names), not string literals.
     As a result, the query returned no rows and code was stuck there even when valid records existed.

3. **Incorrect SQL Query**  - `backend/routes/checkin.js`(Lines- 50,65 )
   The column names were mentioned as lat and long instaed of latitude and longitude respectively.

4. **Checkout was failing** - `backend/routes/checkin.js`(Lines-95 )
   SQL doesn't understand NOW()


### How It Was Fixed
1. **Configured API base URL using environment variables**  
   Added `VITE_API_BASE_URL` to the frontend `.env` file and updated the Axios instance:
   ```js
   const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
   });

 2. **Corrected SQLite string comparison syntax**
    Replaced double quotes with single quotes:  
    `status = 'checked_in'`

 3. **Corrected SQL Query**
    Replaced at and long instaed of latitude with longitude respectively:
    ` "INSERT INTO checkins (employee_id, client_id, latitude, longitude, notes, status)VALUES (?, ?, ?, ?, ?, 'checked_in')" `

  4. **Corrected Checkout** 
     Replaced now tih current-timestamp
     ```js
      await pool.execute(
            "UPDATE checkins SET checkout_time = CURRENT_TIMESTAMP, status = 'checked_out' WHERE id = ?",
            [activeCheckins[0].id]
        );


### WHY THIS FIX IS CORRECT

- Environment-based configuration ensures frontend requests always target the correct backend endpoint.

- Single quotes are required for string literals in SQLite, ensuring correct query behavior.

- Correct column naming ensures database queries align with the actual schema and return acc-urate location data.


## Result
- The check-in form now submits reliably.

### --------------------------------------------------------------------------------------------------------------------------###
