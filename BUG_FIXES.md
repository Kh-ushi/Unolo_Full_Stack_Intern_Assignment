# 🐛 BUG_FIXES.md

This document describes the bugs identified during development, including their locations, root causes, fixes applied, and justification for each fix.

---

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