const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, '..', 'storage', 'database.json');

// Ensure storage directory exists
fs.ensureDirSync(path.dirname(dbPath));

const defaultData = {
  users: [],
  jobs: [],
  applications: [],
  sessions: [],
  audit_logs: []
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Initialize database
async function initDatabase() {
  await db.read();
  
  // If file doesn't exist or is empty, write default data
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
  
  console.log('✅ Local JSON database initialized');
  return db;
}

// Helper functions to mimic SQL operations
const storage = {
  async find(table, query = {}) {
    await db.read();
    const data = db.data[table] || [];
    
    if (Object.keys(query).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  },

  async findOne(table, query) {
    const results = await this.find(table, query);
    return results[0] || null;
  },

  async insert(table, data) {
    await db.read();
    if (!db.data[table]) db.data[table] = [];
    
    const newItem = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString()
    };
    
    db.data[table].push(newItem);
    await db.write();
    return newItem;
  },

  async update(table, id, updates) {
    await db.read();
    const items = db.data[table] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      await db.write();
      return items[index];
    }
    return null;
  },

  async delete(table, id) {
    await db.read();
    const items = db.data[table] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const deleted = items.splice(index, 1)[0];
      await db.write();
      return deleted;
    }
    return null;
  },

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
};

module.exports = { initDatabase, storage, db };
