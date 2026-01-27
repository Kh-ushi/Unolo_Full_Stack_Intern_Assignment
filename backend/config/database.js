const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys

try {
    db.exec('PRAGMA foreign_keys = OFF;');

    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `).all();

    for (const { name } of tables) {
        db.exec(`DROP TABLE IF EXISTS ${name};`);
    }

    db.exec('PRAGMA foreign_keys = ON;');

    console.log('🧹 Old tables removed');

    // Run schema (tables)
    const schemaPath = path.join(__dirname, '../../database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('✅ Schema loaded');

    // Run seed (data)
    const seedPath = path.join(__dirname, '../../database', 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
    console.log('✅ Seed loaded');

} catch (err) {
    console.error('❌ Database init error:', err.message);
}

// Helper to make it work like mysql2 promises (for compatibility)
const execute = (sql, params = []) => {
    const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all();

    console.log('📦 Tables in database:', tables);



    return new Promise((resolve, reject) => {
        try {
            // Replace MySQL ? placeholders - SQLite also uses ? so this should work
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = db.prepare(sql);
                const rows = stmt.all(...params);
                resolve([rows]);
            } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                resolve([{ insertId: result.lastInsertRowid, affectedRows: result.changes }]);
            } else {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                resolve([{ affectedRows: result.changes }]);
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { execute };
