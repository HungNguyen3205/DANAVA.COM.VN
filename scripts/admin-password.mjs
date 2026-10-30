import{randomBytes,scryptSync}from'node:crypto';
let input='';for await(const chunk of process.stdin)input+=chunk;const password=input.trim();if(password.length<12){console.error('Mật khẩu cần ít nhất 12 ký tự. Truyền qua stdin; không đặt trong câu lệnh.');process.exit(1)}const salt=randomBytes(16).toString('hex');console.log(salt+':'+scryptSync(password,salt,64).toString('hex'));
