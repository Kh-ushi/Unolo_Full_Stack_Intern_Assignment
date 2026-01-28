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



# Q4- Explain the difference between SQL and NoSQL databases. For this Field Force Tracker application, which would you recommend and why? Consider factors like data structure, scaling, and query patterns.*

| Aspect | SQL vs NoSQL |
|------|-------------|
| Data Structure | **SQL:** Structured, table-based with fixed schema and strong relationships (e.g., MySQL, PostgreSQL)<br>**NoSQL:** Flexible or schema-less, uses documents, key-value, or wide columns with weak/no enforced relationships (e.g., MongoDB, DynamoDB) |
| Schema & Consistency | **SQL:** Strict schema, strong consistency, ACID transactions, high data integrity<br>**NoSQL:** Flexible schema, often eventual consistency, integrity mostly handled by application |
| Query Patterns | **SQL:** Supports complex queries, JOINs, GROUP BY, aggregations; ideal for relational data and analytics<br>**NoSQL:** Optimized for fast reads/writes, limited joins, data often denormalized |
| Scaling | **SQL:** Primarily vertical scaling; horizontal scaling is complex; best when strong consistency is needed<br>**NoSQL:** Designed for horizontal scaling; handles massive traffic easily with consistency trade-offs |


**I would recommend: SQL Database (MySQL / PostgreSQL)**
- Reasons being
- It is strongly reslational and field force tracker constaing users,clients,checkins etc. makes it naturally realtional
- It has Heavy Aggregation & Reporting hence it becomes easy to calculate Daily summary reports,Per-employee breakdowns,       Working-hour-calculations etc. by relying on `JOINT,COUNT,GROUP BY` with less query required.
-Aggregated Reports can be generated easily
- Also SQL can handle thousands of concurrent users with proper indexing  

# Q5- What is the difference between authentication and authorization? Identify where each is implemented in this codebase.

| Aspect | Authentication vs Authorization |
|------|----------------------------------|
| Purpose | **Authentication:** Verifies identity (Who are you?)<br>**Authorization:** Determines permissions (What are you allowed to do?) |
| What it does | **Authentication:** Confirms the user is who they claim to be<br>**Authorization:** Checks what an authenticated user can access or perform |
| Based on | **Authentication:** Credentials like email/password, OTP, tokens<br>**Authorization:** Roles, ownership, access policies |
| When it happens | **Authentication:** First step (login/signup)<br>**Authorization:** After authentication |

**Implementaion Of Authentication Codebase**
**Location**
-backend/routes/auth.js
-backend/middleware/auth.js


User logs in using email and password (POST /login)
Credentials are validated against the database
On success, a JWT is issued

For protected routes:
JWT is extracted from the Authorization header
Token is verified using jwt.verify
Decoded user info is attached to req.user

**Implementaion Of Authorization Codebase**
**Location**
backend/middleware/auth.js (requireManager function)

- Role-based checks are applied after authentication (for managers)
- Wanted to authorize manager for viweing specific dashboard data and daily-summary

# Q6- Explain what a race condition is. Can you identify any potential race conditions in this codebase? How would you prevent them?

**Defintion**
A race condition happens when the correctness of a program depends on the timing or order of execution of multiple concurrent operations

**Potential Race Conditions in this Codebase**
1. Concurrent Check-Ins for the Same Employee
- Two requests from the same employee arrive at the same time
- Both requests:
Execute the SELECT → see no active check-in
Both proceed to INSERT
- multiple active check-ins for one employee

2. Offline Sync Duplicate Submissions
- When offline check-ins sync later:
The same check-in may be sent twice
Without idempotency, duplicates can be inserted

3. Dashboard Data vs Check-In Writes
  Dashboard reads check-ins
  Check-in writes are happening concurrently
  Dashboard may show:
  Partial data
  Slightly stale data