
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateUser, PLAN_CONFIG, StoredUser } from '../lib/userStorage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This assumes the script is in server/src/scripts/
// server/src/scripts/ -> server/src/ -> server/ -> server/data
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function main() {
    if (!fs.existsSync(USERS_FILE)) {
        console.error('Users file not found at:', USERS_FILE);
        process.exit(1);
    }

    console.log('Reading users from:', USERS_FILE);
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    let parsed;
    try {
        parsed = JSON.parse(data);
    } catch (e) {
        console.error('Failed to parse users.json', e);
        process.exit(1);
    }

    const users: StoredUser[] = parsed.users || [];

    console.log(`Found ${users.length} users. Starting top-up...`);

    for (const user of users) {
        // If plan is undefined, check userStorage logic, it defaults to free.
        // But we are reading raw JSON here, so we might see undefined.
        const plan = user.plan || 'free';
        let targetBalance = 0;

        if (plan === 'free') {
            targetBalance = PLAN_CONFIG.free.monthlyCredits; // 1M
        } else if (plan === 'pro') {
            targetBalance = PLAN_CONFIG.pro.monthlyCredits; // 10M
        } else {
            console.warn(`Unknown plan '${plan}' for user ${user.email}. Defaulting to Free plan amount.`);
            targetBalance = PLAN_CONFIG.free.monthlyCredits;
        }

        console.log(`User: ${user.email} | Plan: ${plan} | Current Balance: ${user.creditBalance} | New Balance: ${targetBalance}`);

        try {
            await updateUser(user.id, {
                creditBalance: targetBalance,
            });
            console.log(`✅ Updated ${user.email}`);
        } catch (err) {
            console.error(`❌ Failed to update ${user.email}:`, err);
        }
    }

    console.log('Top-up complete.');
}

main().catch(console.error);
