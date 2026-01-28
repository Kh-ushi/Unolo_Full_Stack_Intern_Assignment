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
   ```


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
   ```

 2. **Corrected SQLite string comparison syntax**
    Replaced double quotes with single quotes:  
    `status = 'checked_in'`

 3. **Corrected SQL Query**
    Replaced at and long instaed of latitude with longitude respectively:
    ` "INSERT INTO checkins (employee_id, client_id, latitude, longitude, notes, status)VALUES (?, ?, ?, ?, ?, 'checked_in')" `

  4. **Corrected Checkout** 

     Replaced now with current-timestamp
     ```js
      await pool.execute(
            "UPDATE checkins SET checkout_time = CURRENT_TIMESTAMP, status = 'checked_out' WHERE id = ?",
            [activeCheckins[0].id]
        );
      ```

### WHY THIS FIX IS CORRECT

- Environment-based configuration ensures frontend requests always target the correct backend endpoint.

- Single quotes are required for string literals in SQLite, ensuring correct query behavior.

- Correct column naming ensures database queries align with the actual schema and return acc-urate location data.


## Result
- The check-in form now submits reliably.

### --------------------------------------------------------------------------------------------------------------------------###

## 3. Dashboard Stats Not Loading for employees
## Location
- `backend/routes/dashboard.js` (line 85)

### What Was Wrong  
The backend query used MySQL-specific date functions while the application was running on SQLite: `DATE_SUB(NOW(), INTERVAL 7 DAY)`
NOW(), DATE_SUB, and INTERVAL are not supported in SQLite,hence teh query failed

## How It was Fixed
The query was rewritten using SQLite-compatible datetime functions:
```js
           const [weekStats] = await pool.execute(
  `SELECT COUNT(*) AS total_checkins,
          COUNT(DISTINCT client_id) AS unique_clients
   FROM checkins
   WHERE employee_id = ?
     AND checkin_time >= datetime('now', '-7 days')`,
  [req.user.id]
);
```



## Why This Fix Is Correct

SQLite supports datetime('now', '-7 days') for date calculations

The query now executes correctly in the active database


## Result

-Dashboard statistics load correctly
-Weekly check-in counts are accurate
-The dashboard no longer fails due to invalid SQL syntax


### --------------------------------------------------------------------------------------------------------------------------###

## 4.  Attendance history page crashes on load & Clear components have performance issues as it  didn't update correctly
## Location
- `frontend/src/pages/History.jsx` (Lines- 46 & 54,15&111)

### What Was Wrong
1. **Runtime errors while calculating total hours using reduce()** - `frontend/src/pages/History.jsx` (Lines- 46 & 54)
     - The reduce() method was being called on a value that was not always an array.
     - Initial state could be undefined or null
     - Error Showed: `checkins.reduce is not a function`


2. **History did not reset immediately on clicking "Clear"**  - `frontend/src/pages/History.jsx` (15&111)
    - The fetchHistory() function was called immediately after updating React state (setStartDate, setEndDate).
    - Since state updates are asynchronous, fetchHistory() was executed with stale filter values.


 ## How It Was Fixed
 1. **Ensured reduce() is only called on valid arrays,ensuring it retuns 0 in whichever case the result comes null.**
  - Added defensive checks to prevent calling reduce() on non-array values

 2. **Ensured async handling when clearing filters by passing parameter then and there only**
  
 
 ## Why the Fix Is Correct
- Defensive handling of API responses prevents runtime crashes and improves UI stability.
- Passing parameter then and there only does not make fetchHistory calculate with stale parameters

## Result

- Clicking “Clear” immediately refreshes the history view

- Total hours calculation works reliably

- No runtime errors from reduce()

- History view behaves predictably across renders

### --------------------------------------------------------------------------------------------------------------------------###

## 5.  API returns wrong status codes in certain scenarios

## Location
- `backend/routes/checkin.js` (Line-33)

### What Was Wrong
- Returning 200 OK incorrectly signals success


 ## How It Was Fixed
 - Replaced with 400 status code

 ## Why was the fix correct
 - Meaning of 400- The client sent a request that the server cannot process because it is invalid.


 ### --------------------------------------------------------------------------------------------------------------------------###

 ## 6.Location Data Not Saved Correctly During Check-In

 ## Location of Error
 - `frontend/src/pages/CheckIn.jsx` (Lines-61-102 , CheckIn function has been changed )

 ### What Was Wrong

 1. **The check-in API was being triggered before the user’s geolocation was available.**
 - navigator.geolocation.getCurrentPosition() is asynchronous

 - React state updates (setLocation) are also asynchronous

 - The check-in API call relied on state values that were not yet populated

 - As a result, latitude and longitude were often undefined and default value of gurgaon was always being set as location

 - A fallback location of Gurgaon masked the issue.

  
 ## How It Was Fixed
 - The check-in API call was moved inside the geolocation success callback, ensuring coordinates are available before submission.
 - Default fallback coordinates were removed, and explicit user feedback was added when location access is denied.

 ## Why the Fix Is Correct
 - Geolocation data is guaranteed to exist before the API request is sent
 - Prevents incorrect or fake location data from being stored
 - Ensures backend receives accurate, user-specific GPS coordinates

 ## Result
 - Location data is now consistently saved correctly

 ### --------------------------------------------------------------------------------------------------------------------------###