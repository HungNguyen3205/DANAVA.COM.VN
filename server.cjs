// cPanel Application Startup File. Keep credentials in hosting environment variables.
const path=require('node:path');
process.env.HOSTNAME=process.env.DANAVA_HOSTNAME||'0.0.0.0';
process.env.DANAVA_DATA_DIR=process.env.DANAVA_DATA_DIR||path.join(__dirname,'.data');
import('./.next/standalone/server.js').catch(error=>{console.error(error);process.exit(1)});
