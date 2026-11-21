// cPanel Application Startup File (nhánh deploy). Cấu hình nằm trong biến môi trường của cPanel.
const path = require('node:path');
process.env.HOSTNAME = process.env.DANAVA_HOSTNAME || '0.0.0.0';
process.env.DANAVA_DATA_DIR = process.env.DANAVA_DATA_DIR || path.join(__dirname, '.data');
require('./standalone/server.js');
