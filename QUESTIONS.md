# Technical Questions-Answers

# Q1-If this app had 10,000 employees checking in simultaneously, what would break first? How would you fix it?

**WHAT WOULD BREAK FIRST**
 - **Frontend , Geo-Location-API & Distance Calulation**
- Many concurrent checking would create database pressure as every check-in is a write operation
- Due to many concurrent check-ins there may be table-level or row-level locks
- Database becomes the bottleneck first as databases have finite concurrent write capacity
- SQLite is not designed for high concurrent writes

- Second thing would be API Latency
- Backend threads wait on DB writes and hence requests would queue up
- Users experience would becom slow in check-ins.

**HOW WOULD YOU FIX IT**

- **Step 1: Move off SQLite**
- As SQLite allows one writer at a time hence for 10k concurrent users, it will fail quickly

- **Step 2: Index for write-heavy paths**
- It would help in faster lookups hence reducing lock time

-**Step 3: Introduce async write buffering**
- Instead of writing immediately API accepts check-in & Pushes event to a queue
- Hence API stays responsive & DB operations are smoothed

-**Step 4: Horizontal scaling**
- Scaling can be done with load balancer for stateless backend


**TRADE-OFFS**
Due to the introduction of asynchronous queues, the dashboard may experience slight delays as data is processed asynchronously




# Q2-The current JWT implementation has a security issue. What is it and how would you improve it?

- The current JWT implementation includes sensitive information—specifically the user’s password insthe the token payload, which is a security risk. JWTs should only contain non-sensitive, minimal claims.

```js
jwt.sign(
  { 
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    password: user.password  // security issue
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

- It is dangerous because JWT payload is Base64-encoded, not encrypted and hence anyone who gets the token can decode it
- Also if tokens contain more data than needed it will comnsume more bandwith.


- I would fix it by simply minimizing the jwt payload
 ```js
jwt.sign(
  {
    id: user.id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```
- It contains non sensitive data, enough to authorize requests


# Q3-How would you implement offline check-in support? (Employee has no internet, checks in, syncs later)?

  **ON FRONTEND**
- I would start first with frontend by checking whether status is offline or online using:`navigator.onLine`.
- If offline I would not call the backend API and would store check-in data locally.
- I would listen for online connection and on reconnect: read all pending check-ins from local storage.
- Send them to the backend in sequence or batches.
- Mark records sync after successfull upload.

**ON BACKEND**

- I would add  a client-generated unique identifier for each check-in
- Send this ID with the check-in request and Store it in the database with a unique constraint
- If the same check-in is sent again, the backend ignores duplicates safely
- For future use I will save Store both: 
 Client-side check-in time &
 Server-received time

