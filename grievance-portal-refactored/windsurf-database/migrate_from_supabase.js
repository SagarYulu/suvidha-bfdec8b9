
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 1000;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// MySQL configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'grievance_portal',
    timezone: '+00:00'
};

// Logging utility
const log = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    if (data && process.env.LOG_LEVEL === 'debug') {
        console.log(JSON.stringify(data, null, 2));
    }
};

// Data transformation utilities
const transformUUID = (uuid) => {
    return uuid || null;
};

const transformTimestamp = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
};

const transformJSON = (data) => {
    if (!data) return null;
    return typeof data === 'string' ? data : JSON.stringify(data);
};

// Table migration configurations
const MIGRATION_CONFIG = {
    employees: {
        supabaseTable: 'employees',
        mysqlTable: 'employees',
        transform: (row) => ({
            id: transformUUID(row.id),
            emp_id: row.emp_id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            user_id: row.user_id,
            password: row.password,
            manager: row.manager,
            role: row.role,
            cluster: row.cluster,
            city: row.city,
            date_of_birth: row.date_of_birth,
            date_of_joining: row.date_of_joining,
            ifsc_code: row.ifsc_code,
            account_number: row.account_number,
            blood_group: row.blood_group,
            created_at: transformTimestamp(row.created_at),
            updated_at: transformTimestamp(row.updated_at)
        })
    },
    dashboard_users: {
        supabaseTable: 'dashboard_users',
        mysqlTable: 'dashboard_users',
        transform: (row) => ({
            id: transformUUID(row.id),
            name: row.name,
            email: row.email,
            employee_id: row.employee_id,
            password: row.password,
            role: row.role,
            manager: row.manager,
            cluster: row.cluster,
            city: row.city,
            phone: row.phone,
            user_id: row.user_id,
            created_by: transformUUID(row.created_by),
            last_updated_by: transformUUID(row.last_updated_by),
            created_at: transformTimestamp(row.created_at),
            updated_at: transformTimestamp(row.updated_at)
        })
    },
    issues: {
        supabaseTable: 'issues',
        mysqlTable: 'issues',
        transform: (row) => ({
            id: transformUUID(row.id),
            employee_uuid: transformUUID(row.employee_uuid),
            type_id: row.type_id,
            sub_type_id: row.sub_type_id,
            description: row.description,
            status: row.status,
            priority: row.priority,
            assigned_to: transformUUID(row.assigned_to),
            mapped_type_id: row.mapped_type_id,
            mapped_sub_type_id: row.mapped_sub_type_id,
            mapped_by: transformUUID(row.mapped_by),
            mapped_at: transformTimestamp(row.mapped_at),
            closed_at: transformTimestamp(row.closed_at),
            attachments: transformJSON(row.attachments),
            attachment_url: row.attachment_url,
            created_at: transformTimestamp(row.created_at),
            updated_at: transformTimestamp(row.updated_at)
        })
    },
    issue_comments: {
        supabaseTable: 'issue_comments',
        mysqlTable: 'issue_comments',
        transform: (row) => ({
            id: transformUUID(row.id),
            issue_id: transformUUID(row.issue_id),
            employee_uuid: transformUUID(row.employee_uuid),
            content: row.content,
            created_at: transformTimestamp(row.created_at)
        })
    },
    issue_internal_comments: {
        supabaseTable: 'issue_internal_comments',
        mysqlTable: 'issue_internal_comments',
        transform: (row) => ({
            id: transformUUID(row.id),
            issue_id: transformUUID(row.issue_id),
            employee_uuid: transformUUID(row.employee_uuid),
            content: row.content,
            created_at: transformTimestamp(row.created_at),
            updated_at: transformTimestamp(row.updated_at)
        })
    },
    issue_audit_trail: {
        supabaseTable: 'issue_audit_trail',
        mysqlTable: 'issue_audit_trail',
        transform: (row) => ({
            id: transformUUID(row.id),
            issue_id: transformUUID(row.issue_id),
            employee_uuid: transformUUID(row.employee_uuid),
            action: row.action,
            previous_status: row.previous_status,
            new_status: row.new_status,
            details: transformJSON(row.details),
            created_at: transformTimestamp(row.created_at)
        })
    },
    ticket_feedback: {
        supabaseTable: 'ticket_feedback',
        mysqlTable: 'ticket_feedback',
        transform: (row) => ({
            id: transformUUID(row.id),
            issue_id: transformUUID(row.issue_id),
            employee_uuid: transformUUID(row.employee_uuid),
            feedback_option: row.feedback_option,
            sentiment: row.sentiment,
            city: row.city,
            cluster: row.cluster,
            agent_id: transformUUID(row.agent_id),
            agent_name: row.agent_name,
            created_at: transformTimestamp(row.created_at)
        })
    },
    issue_notifications: {
        supabaseTable: 'issue_notifications',
        mysqlTable: 'issue_notifications',
        transform: (row) => ({
            id: transformUUID(row.id),
            issue_id: transformUUID(row.issue_id),
            user_id: transformUUID(row.user_id),
            content: row.content,
            is_read: row.is_read ? 1 : 0,
            created_at: transformTimestamp(row.created_at)
        })
    }
};

// Migration functions
async function testConnections() {
    log('info', 'Testing database connections...');
    
    try {
        // Test Supabase connection
        const { data, error } = await supabase.from('employees').select('count').limit(1);
        if (error) throw new Error(`Supabase connection failed: ${error.message}`);
        log('info', '✓ Supabase connection successful');
        
        // Test MySQL connection
        const connection = await mysql.createConnection(mysqlConfig);
        await connection.execute('SELECT 1');
        await connection.end();
        log('info', '✓ MySQL connection successful');
        
        return true;
    } catch (error) {
        log('error', 'Connection test failed:', error.message);
        return false;
    }
}

async function getTableData(tableName, offset = 0, limit = BATCH_SIZE) {
    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        return { data: data || [], count };
    } catch (error) {
        log('error', `Failed to fetch data from ${tableName}:`, error.message);
        throw error;
    }
}

async function insertBatch(connection, tableName, rows) {
    if (rows.length === 0) return;
    
    const columns = Object.keys(rows[0]);
    const placeholders = rows.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    const values = rows.flatMap(row => columns.map(col => row[col]));
    
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
    
    try {
        await connection.execute(query, values);
        log('info', `✓ Inserted ${rows.length} rows into ${tableName}`);
    } catch (error) {
        log('error', `Failed to insert batch into ${tableName}:`, error.message);
        throw error;
    }
}

async function migrateTable(tableName, config) {
    log('info', `Starting migration for table: ${tableName}`);
    
    const connection = await mysql.createConnection(mysqlConfig);
    
    try {
        // Clear existing data
        await connection.execute(`DELETE FROM ${config.mysqlTable}`);
        log('info', `Cleared existing data from ${config.mysqlTable}`);
        
        let offset = 0;
        let totalMigrated = 0;
        let hasMore = true;
        
        while (hasMore) {
            const { data, count } = await getTableData(config.supabaseTable, offset, BATCH_SIZE);
            
            if (data.length === 0) {
                hasMore = false;
                break;
            }
            
            // Transform data
            const transformedRows = data.map(config.transform).filter(row => row !== null);
            
            // Insert batch
            if (transformedRows.length > 0) {
                await insertBatch(connection, config.mysqlTable, transformedRows);
                totalMigrated += transformedRows.length;
            }
            
            offset += BATCH_SIZE;
            hasMore = offset < count;
            
            log('info', `Progress: ${Math.min(offset, count)}/${count} rows processed`);
        }
        
        log('info', `✓ Migration completed for ${tableName}. Total migrated: ${totalMigrated} rows`);
        
    } catch (error) {
        log('error', `Migration failed for ${tableName}:`, error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

async function verifyMigration() {
    log('info', 'Verifying migration results...');
    
    const connection = await mysql.createConnection(mysqlConfig);
    
    try {
        for (const [tableName, config] of Object.entries(MIGRATION_CONFIG)) {
            // Count rows in MySQL
            const [mysqlCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${config.mysqlTable}`);
            
            // Count rows in Supabase
            const { count: supabaseCount } = await supabase
                .from(config.supabaseTable)
                .select('*', { count: 'exact', head: true });
            
            const mysqlRows = mysqlCount[0].count;
            const status = mysqlRows === supabaseCount ? '✓' : '✗';
            
            log('info', `${status} ${tableName}: MySQL(${mysqlRows}) vs Supabase(${supabaseCount})`);
        }
        
    } catch (error) {
        log('error', 'Verification failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

async function main() {
    log('info', '🚀 Starting Supabase to MySQL migration...');
    
    try {
        // Test connections
        if (!(await testConnections())) {
            process.exit(1);
        }
        
        // Migration order (respecting foreign key dependencies)
        const migrationOrder = [
            'employees',
            'dashboard_users',
            'issues',
            'issue_comments',
            'issue_internal_comments',
            'issue_audit_trail',
            'issue_notifications',
            'ticket_feedback'
        ];
        
        // Migrate each table
        for (const tableName of migrationOrder) {
            if (MIGRATION_CONFIG[tableName]) {
                await migrateTable(tableName, MIGRATION_CONFIG[tableName]);
            }
        }
        
        // Verify migration
        await verifyMigration();
        
        log('info', '🎉 Migration completed successfully!');
        
    } catch (error) {
        log('error', '💥 Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration if called directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    testConnections,
    migrateTable,
    verifyMigration
};
